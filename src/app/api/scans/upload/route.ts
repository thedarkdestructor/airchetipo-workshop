import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("image");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing image field" },
      { status: 400 }
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "File must be an image" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File exceeds 10MB limit" },
      { status: 413 }
    );
  }

  const scanId = randomUUID();
  const ext = file.name.split(".").pop() || "jpg";
  const storagePath = `${user.id}/${scanId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("scans")
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    return NextResponse.json(
      { error: "Upload failed", detail: uploadError.message },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("scans").getPublicUrl(storagePath);

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });

  if (!dbUser) {
    await supabase.storage.from("scans").remove([storagePath]);
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  try {
    const scan = await prisma.scan.create({
      data: {
        id: scanId,
        userId: dbUser.id,
        imageUrl: publicUrl,
      },
    });
    return NextResponse.json({ scanId: scan.id, imageUrl: scan.imageUrl });
  } catch {
    await supabase.storage.from("scans").remove([storagePath]);
    return NextResponse.json(
      { error: "Failed to save scan" },
      { status: 500 }
    );
  }
}
