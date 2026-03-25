import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";

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

const mockFindUnique = vi.fn();
const mockCreate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: (...args: unknown[]) => mockFindUnique(...args) },
    scan: { create: (...args: unknown[]) => mockCreate(...args) },
  },
}));

function buildImageRequest(
  file: File | null,
  fieldName = "image"
): Request {
  const formData = new FormData();
  if (file) {
    formData.append(fieldName, file);
  }
  return new Request("http://localhost/api/scans/upload", {
    method: "POST",
    body: formData,
  });
}

function createImageFile(
  name = "photo.png",
  type = "image/png",
  sizeBytes = 1024
): File {
  const buffer = new Uint8Array(sizeBytes);
  return new File([buffer], name, { type });
}

describe("POST /api/scans/upload", () => {
  const fakeUser = { id: "supabase-user-id-123" };
  const fakeDbUser = { id: "db-user-uuid-456", supabaseId: fakeUser.id };

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetUser.mockResolvedValue({ data: { user: fakeUser } });
    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://storage.example.com/scans/photo.png" },
    });
    mockFindUnique.mockResolvedValue(fakeDbUser);
    mockCreate.mockImplementation(({ data }) => ({
      id: data.id,
      imageUrl: data.imageUrl,
    }));
  });

  it("should return 200 with scanId and imageUrl when upload is valid", async () => {
    const file = createImageFile();
    const request = buildImageRequest(file);

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty("scanId");
    expect(body).toHaveProperty("imageUrl");
    expect(body.imageUrl).toBe(
      "https://storage.example.com/scans/photo.png"
    );
    expect(mockUpload).toHaveBeenCalledOnce();
    expect(mockCreate).toHaveBeenCalledOnce();
  });

  it("should return 413 when file exceeds 10MB", async () => {
    const oversize = 10 * 1024 * 1024 + 1;
    const file = createImageFile("big.jpg", "image/jpeg", oversize);
    const request = buildImageRequest(file);

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(413);
    expect(body.error).toBe("File exceeds 10MB limit");
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it("should return 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const file = createImageFile();
    const request = buildImageRequest(file);

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("should return 400 when file is not an image", async () => {
    const file = new File([new Uint8Array(100)], "doc.pdf", {
      type: "application/pdf",
    });
    const request = buildImageRequest(file);

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("File must be an image");
  });

  it("should return 400 when image field is missing from FormData", async () => {
    const request = buildImageRequest(null);

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Missing image field");
  });

  it("should return 500 when Supabase upload fails", async () => {
    mockUpload.mockResolvedValue({ error: new Error("Storage error") });
    const file = createImageFile();
    const request = buildImageRequest(file);

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Upload failed");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("should return 404 when Prisma user is not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    const file = createImageFile();
    const request = buildImageRequest(file);

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("User not found");
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
