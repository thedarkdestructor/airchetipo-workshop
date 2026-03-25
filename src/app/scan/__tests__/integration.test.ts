import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as uploadPOST } from "@/app/api/scans/upload/route";
import { POST as recognizePOST } from "@/app/api/scans/[scanId]/recognize/route";

// ---------------------------------------------------------------------------
// In-memory state shared between upload and recognize mocks
// ---------------------------------------------------------------------------
let mockScans: Record<string, any> = {};
let mockIngredients: any[] = [];

// ---------------------------------------------------------------------------
// Supabase mock (auth + storage)
// ---------------------------------------------------------------------------
const mockGetUser = vi.fn();
const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();
const mockRemove = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
    storage: {
      from: () => ({
        upload: (...args: unknown[]) => mockUpload(...args),
        getPublicUrl: (...args: unknown[]) => mockGetPublicUrl(...args),
        remove: (...args: unknown[]) => mockRemove(...args),
      }),
    },
  }),
}));

// ---------------------------------------------------------------------------
// Prisma mock — backed by in-memory stores so upload creates data that
// recognize can read back
// ---------------------------------------------------------------------------
const mockUserFindUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
    },
    scan: {
      create: vi.fn().mockImplementation(({ data }: any) => {
        const scan = {
          id: data.id,
          userId: data.userId,
          imageUrl: data.imageUrl,
          status: "PENDING",
          ingredients: [],
        };
        mockScans[data.id] = scan;
        return scan;
      }),
      findFirst: vi.fn().mockImplementation(({ where }: any) => {
        const scan = mockScans[where.id];
        if (!scan || scan.userId !== where.userId) return null;
        return { ...scan, ingredients: mockIngredients };
      }),
      update: vi.fn().mockImplementation(({ where, data }: any) => {
        if (mockScans[where.id]) {
          mockScans[where.id] = { ...mockScans[where.id], ...data };
        }
        return mockScans[where.id];
      }),
    },
    scanIngredient: {
      createManyAndReturn: vi.fn().mockImplementation(({ data }: any) => {
        const saved = data.map((item: any, i: number) => ({
          id: `ingredient-${i}`,
          ...item,
        }));
        mockIngredients.push(...saved);
        return saved;
      }),
    },
    $transaction: vi.fn().mockImplementation((operations: Promise<unknown>[]) =>
      Promise.all(operations),
    ),
  },
}));

// ---------------------------------------------------------------------------
// OpenRouter mock
// ---------------------------------------------------------------------------
const mockRecognizeIngredients = vi.fn();

vi.mock("@/lib/ai/openrouter", () => ({
  recognizeIngredients: (...args: unknown[]) =>
    mockRecognizeIngredients(...args),
}));

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------
const fakeUser = { id: "supabase-user-id-integration" };
const fakeDbUser = {
  id: "db-user-uuid-integration",
  supabaseId: fakeUser.id,
  email: "integration@test.com",
};

const fakeAiIngredients = [
  { name: "Pomodoro", emoji: "\ud83c\udf45", category: "verdure", confidence: 0.95, detail: "San Marzano" },
  { name: "Mozzarella", emoji: "\ud83e\uddc0", category: "latticini", confidence: 0.88 },
  { name: "Basilico", emoji: "\ud83c\udf3f", category: "verdure", confidence: 0.91 },
  { name: "Vino Rosso", emoji: "\ud83c\udf77", category: "bevande", confidence: 0.72 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function createImageFile(
  name = "photo.png",
  type = "image/png",
  sizeBytes = 1024,
): File {
  const buffer = new Uint8Array(sizeBytes);
  return new File([buffer], name, { type });
}

function buildUploadRequest(file: File): Request {
  const formData = new FormData();
  formData.append("image", file);
  return new Request("http://localhost/api/scans/upload", {
    method: "POST",
    body: formData,
  });
}

function buildRecognizeRequest(scanId: string): Request {
  return new Request(
    `http://localhost/api/scans/${scanId}/recognize`,
    { method: "POST" },
  );
}

function buildRouteParams(scanId: string) {
  return { params: Promise.resolve({ scanId }) };
}

/** Runs the full upload -> recognize chain and returns both responses. */
async function runUploadAndRecognize() {
  const file = createImageFile();
  const uploadResponse = await uploadPOST(buildUploadRequest(file));
  const uploadBody = await uploadResponse.json();

  const scanId: string = uploadBody.scanId;
  const recognizeResponse = await recognizePOST(
    buildRecognizeRequest(scanId),
    buildRouteParams(scanId),
  );
  const recognizeBody = await recognizeResponse.json();

  return { uploadResponse, uploadBody, recognizeResponse, recognizeBody, scanId };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("Integration: upload -> recognize -> display flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockScans = {};
    mockIngredients = [];

    // Happy-path defaults
    mockGetUser.mockResolvedValue({ data: { user: fakeUser } });
    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://storage.example.com/scans/photo.png" },
    });
    mockUserFindUnique.mockResolvedValue(fakeDbUser);
    mockRecognizeIngredients.mockResolvedValue({
      ingredients: fakeAiIngredients,
      model: "google/gemini-2.0-flash-001",
      durationMs: 950,
    });
  });

  it("should complete the full flow: upload image -> recognize ingredients -> return grouped results", async () => {
    const { uploadResponse, uploadBody, recognizeResponse, recognizeBody, scanId } =
      await runUploadAndRecognize();

    // Upload succeeded
    expect(uploadResponse.status).toBe(200);
    expect(uploadBody.scanId).toBeDefined();
    expect(uploadBody.imageUrl).toBe(
      "https://storage.example.com/scans/photo.png",
    );

    // Recognize succeeded and used the same scanId
    expect(recognizeResponse.status).toBe(200);
    expect(recognizeBody.scanId).toBe(scanId);
    expect(recognizeBody.status).toBe("RECOGNIZED");
    expect(recognizeBody.ingredients).toHaveLength(fakeAiIngredients.length);

    // Summary is present with correct totals
    expect(recognizeBody.summary).toBeDefined();
    expect(recognizeBody.summary.total).toBe(fakeAiIngredients.length);

    // AI was called with the URL from upload
    expect(mockRecognizeIngredients).toHaveBeenCalledWith(
      "https://storage.example.com/scans/photo.png",
    );
  });

  it("should return ingredients grouped by category in recognize response", async () => {
    const { recognizeBody } = await runUploadAndRecognize();

    const categories = new Set(
      recognizeBody.ingredients.map((i: any) => i.category),
    );

    // The fixture has verdure, latticini, and bevande
    expect(categories.size).toBeGreaterThanOrEqual(2);
    expect(categories).toContain("verdure");
    expect(categories).toContain("latticini");
    expect(categories).toContain("bevande");
  });

  it("should show confidence scores for all ingredients", async () => {
    const { recognizeBody } = await runUploadAndRecognize();

    for (const ingredient of recognizeBody.ingredients) {
      expect(ingredient.confidence).toBeGreaterThanOrEqual(0);
      expect(ingredient.confidence).toBeLessThanOrEqual(1);
      expect(typeof ingredient.confidence).toBe("number");
    }
  });

  it("should handle recognition error gracefully when API is unavailable", async () => {
    mockRecognizeIngredients.mockRejectedValue(
      new Error("OpenRouter API error 500: Internal Server Error"),
    );

    const file = createImageFile();
    const uploadResponse = await uploadPOST(buildUploadRequest(file));
    const uploadBody = await uploadResponse.json();

    // Upload still succeeds
    expect(uploadResponse.status).toBe(200);

    const scanId: string = uploadBody.scanId;
    const recognizeResponse = await recognizePOST(
      buildRecognizeRequest(scanId),
      buildRouteParams(scanId),
    );
    const recognizeBody = await recognizeResponse.json();

    expect(recognizeResponse.status).toBe(502);
    expect(recognizeBody.error).toBe("AI service unavailable");
    expect(recognizeBody.detail).toBe(
      "OpenRouter API error 500: Internal Server Error",
    );
  });

  it("should handle recognition timeout", async () => {
    mockRecognizeIngredients.mockRejectedValue(
      new Error("OpenRouter request timed out"),
    );

    const file = createImageFile();
    const uploadResponse = await uploadPOST(buildUploadRequest(file));
    const uploadBody = await uploadResponse.json();

    // Upload still succeeds
    expect(uploadResponse.status).toBe(200);

    const scanId: string = uploadBody.scanId;
    const recognizeResponse = await recognizePOST(
      buildRecognizeRequest(scanId),
      buildRouteParams(scanId),
    );
    const recognizeBody = await recognizeResponse.json();

    expect(recognizeResponse.status).toBe(504);
    expect(recognizeBody.error).toBe("Recognition timed out");
  });
});
