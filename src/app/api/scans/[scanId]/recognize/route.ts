import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { recognizeIngredients } from "@/lib/ai/openrouter";

interface RouteParams {
  params: Promise<{ scanId: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { scanId } = await params;

  const scan = await prisma.scan.findFirst({
    where: { id: scanId, userId: dbUser.id },
    include: { ingredients: true },
  });

  if (!scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  if (scan.status !== "PENDING") {
    return NextResponse.json({
      scanId: scan.id,
      status: scan.status,
      ingredients: scan.ingredients,
      summary: buildSummary(scan.ingredients, 0),
    });
  }

  try {
    const result = await recognizeIngredients(scan.imageUrl);

    const [ingredients] = await prisma.$transaction([
      prisma.scanIngredient.createManyAndReturn({
        data: result.ingredients.map((ing) => ({
          scanId,
          name: ing.name,
          emoji: ing.emoji,
          category: ing.category,
          confidence: ing.confidence,
          detail: ing.detail ?? null,
          source: "AI" as const,
        })),
      }),
      prisma.scan.update({
        where: { id: scanId },
        data: { status: "RECOGNIZED" },
      }),
    ]);

    return NextResponse.json({
      scanId,
      status: "RECOGNIZED",
      ingredients,
      summary: buildSummary(ingredients, result.durationMs),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("timed out")) {
      return NextResponse.json(
        { error: "Recognition timed out" },
        { status: 504 }
      );
    }

    console.error("Recognition error:", err);
    return NextResponse.json(
      { error: "AI service unavailable", detail: message },
      { status: 502 }
    );
  }
}

function buildSummary(
  ingredients: { category: string; confidence: number }[],
  durationMs: number
) {
  const totalBeverages = ingredients.filter(
    (i) => i.category === "bevande"
  ).length;
  const avgConfidence =
    ingredients.length > 0
      ? ingredients.reduce((sum, i) => sum + i.confidence, 0) /
        ingredients.length
      : 0;

  return {
    total: ingredients.length,
    totalBeverages,
    avgConfidence: Math.round(avgConfidence * 100) / 100,
    durationMs,
  };
}
