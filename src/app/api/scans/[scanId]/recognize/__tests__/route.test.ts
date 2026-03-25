import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";

const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
  }),
}));

const mockUserFindUnique = vi.fn();
const mockScanFindFirst = vi.fn();
const mockScanUpdate = vi.fn();
const mockCreateManyAndReturn = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: (...args: unknown[]) => mockUserFindUnique(...args) },
    scan: {
      findFirst: (...args: unknown[]) => mockScanFindFirst(...args),
      update: (...args: unknown[]) => mockScanUpdate(...args),
    },
    scanIngredient: {
      createManyAndReturn: (...args: unknown[]) =>
        mockCreateManyAndReturn(...args),
    },
    $transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

const mockRecognizeIngredients = vi.fn();

vi.mock("@/lib/ai/openrouter", () => ({
  recognizeIngredients: (...args: unknown[]) =>
    mockRecognizeIngredients(...args),
}));

const mockUser = { id: "supabase-user-id", email: "test@example.com" };
const mockDbUser = {
  id: "db-user-id",
  supabaseId: "supabase-user-id",
  email: "test@example.com",
};
const mockScan = {
  id: "scan-123",
  userId: "db-user-id",
  imageUrl: "https://storage.example.com/scans/test.jpg",
  status: "PENDING",
  ingredients: [],
};

const mockAiIngredients = [
  {
    name: "Pomodoro",
    emoji: "\ud83c\udf45",
    category: "verdure",
    confidence: 0.95,
    detail: "San Marzano",
  },
  {
    name: "Mozzarella",
    emoji: "\ud83e\uddc0",
    category: "latticini",
    confidence: 0.88,
  },
  {
    name: "Vino Rosso",
    emoji: "\ud83c\udf77",
    category: "bevande",
    confidence: 0.72,
  },
];

function buildRequest(scanId = "scan-123") {
  return new Request(
    `http://localhost/api/scans/${scanId}/recognize`,
    { method: "POST" },
  );
}

function buildRouteParams(scanId = "scan-123") {
  return { params: Promise.resolve({ scanId }) };
}

describe("POST /api/scans/[scanId]/recognize", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
    mockUserFindUnique.mockResolvedValue(mockDbUser);
    mockScanFindFirst.mockResolvedValue(mockScan);
    mockRecognizeIngredients.mockResolvedValue({
      ingredients: mockAiIngredients,
      model: "google/gemini-2.0-flash-001",
      durationMs: 1200,
    });

    const savedIngredients = mockAiIngredients.map((ing) => ({
      ...ing,
      scanId: "scan-123",
      source: "AI",
      detail: ing.detail ?? null,
    }));
    mockTransaction.mockResolvedValue([savedIngredients, { id: "scan-123", status: "RECOGNIZED" }]);
  });

  it("should return 200 with categorized ingredients when recognition succeeds", async () => {
    const response = await POST(buildRequest(), buildRouteParams());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.scanId).toBe("scan-123");
    expect(body.status).toBe("RECOGNIZED");
    expect(body.ingredients).toHaveLength(3);
    expect(body.summary).toEqual({
      total: 3,
      totalBeverages: 1,
      avgConfidence: 0.85,
      durationMs: 1200,
    });
    expect(mockRecognizeIngredients).toHaveBeenCalledWith(
      "https://storage.example.com/scans/test.jpg",
    );
  });

  it("should return 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const response = await POST(buildRequest(), buildRouteParams());
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
    expect(mockScanFindFirst).not.toHaveBeenCalled();
  });

  it("should return 404 when user is not found in database", async () => {
    mockUserFindUnique.mockResolvedValue(null);

    const response = await POST(buildRequest(), buildRouteParams());
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("User not found");
    expect(mockScanFindFirst).not.toHaveBeenCalled();
  });

  it("should return 404 when scan does not exist", async () => {
    mockScanFindFirst.mockResolvedValue(null);

    const response = await POST(buildRequest("nonexistent"), buildRouteParams("nonexistent"));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Scan not found");
    expect(mockRecognizeIngredients).not.toHaveBeenCalled();
  });

  it("should return 404 when scan belongs to another user", async () => {
    mockScanFindFirst.mockResolvedValue(null);

    const response = await POST(buildRequest(), buildRouteParams());
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Scan not found");
    expect(mockRecognizeIngredients).not.toHaveBeenCalled();
  });

  it("should return existing ingredients when scan is already recognized", async () => {
    const existingIngredients = mockAiIngredients.map((ing) => ({
      ...ing,
      scanId: "scan-123",
      source: "AI",
    }));
    mockScanFindFirst.mockResolvedValue({
      ...mockScan,
      status: "RECOGNIZED",
      ingredients: existingIngredients,
    });

    const response = await POST(buildRequest(), buildRouteParams());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.scanId).toBe("scan-123");
    expect(body.status).toBe("RECOGNIZED");
    expect(body.ingredients).toHaveLength(3);
    expect(mockRecognizeIngredients).not.toHaveBeenCalled();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("should return 504 when OpenRouter times out", async () => {
    mockRecognizeIngredients.mockRejectedValue(
      new Error("OpenRouter request timed out"),
    );

    const response = await POST(buildRequest(), buildRouteParams());
    const body = await response.json();

    expect(response.status).toBe(504);
    expect(body.error).toBe("Recognition timed out");
  });

  it("should return 502 when OpenRouter returns an API error", async () => {
    mockRecognizeIngredients.mockRejectedValue(
      new Error("OpenRouter API error 500: Internal Server Error"),
    );

    const response = await POST(buildRequest(), buildRouteParams());
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.error).toBe("AI service unavailable");
    expect(body.detail).toBe(
      "OpenRouter API error 500: Internal Server Error",
    );
  });

  it("should not include API key in response", async () => {
    const response = await POST(buildRequest(), buildRouteParams());
    const text = await response.clone().text();

    expect(text).not.toContain("OPENROUTER_API_KEY");
    expect(text).not.toContain("Bearer");
  });

  it("should update scan status to RECOGNIZED after successful recognition", async () => {
    await POST(buildRequest(), buildRouteParams());

    expect(mockTransaction).toHaveBeenCalledOnce();

    const transactionArg = mockTransaction.mock.calls[0][0];
    expect(transactionArg).toHaveLength(2);
  });
});
