"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import { toast } from "sonner";

/* ---------- Types ---------- */

interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  category: string;
  confidence: number;
  detail?: string | null;
}

interface Summary {
  total: number;
  totalBeverages: number;
  avgConfidence: number;
  durationMs: number;
}

interface RecognizeResponse {
  ingredients: Ingredient[];
  summary: Summary;
}

/* ---------- Constants ---------- */

const CATEGORY_META: Record<string, { emoji: string; label: string }> = {
  verdure:  { emoji: "\u{1F96C}", label: "Verdure" },
  carne:    { emoji: "\u{1F969}", label: "Carne" },
  pesce:    { emoji: "\u{1F41F}", label: "Pesce" },
  latticini:{ emoji: "\u{1F9C0}", label: "Latticini" },
  bevande:  { emoji: "\u{1F377}", label: "Bevande" },
  dispensa: { emoji: "\u{1FAD9}", label: "Dispensa" },
  altro:    { emoji: "\u{1F37D}\uFE0F", label: "Altro" },
};

const CATEGORY_ORDER = Object.keys(CATEGORY_META);

/* ---------- Helpers ---------- */

function confidenceDotColor(c: number): string {
  if (c >= 0.8) return "bg-[oklch(0.65_0.18_145)]";
  if (c >= 0.5) return "bg-[oklch(0.72_0.14_85)]";
  return "bg-[oklch(0.55_0.22_25)]";
}

function groupByCategory(items: Ingredient[]) {
  const groups: Record<string, Ingredient[]> = {};
  for (const item of items) {
    const cat = item.category || "altro";
    (groups[cat] ??= []).push(item);
  }
  return CATEGORY_ORDER
    .filter((cat) => groups[cat]?.length)
    .map((cat) => ({ category: cat, items: groups[cat] }));
}

/* ---------- Sub-components ---------- */

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 pt-24">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
        style={{
          background: "linear-gradient(135deg, oklch(0.82 0.06 50), oklch(0.72 0.12 35))",
        }}
      >
        <span className="animate-pulse">{"\u{1F4F8}"}</span>
      </div>

      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[oklch(0.93_0.015_85)] border-t-[oklch(0.55_0.22_25)]" />

      <p className="font-['DM_Serif_Display',Georgia,serif] text-lg text-[oklch(0.25_0.02_50)]">
        Identifico gli ingredienti
        <span className="animate-pulse">...</span>
      </p>
      <p className="text-xs text-[oklch(0.55_0.02_50)]">AI Vision in azione</p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 pt-24 px-6 text-center">
      <span className="text-4xl">{"\u{274C}"}</span>
      <p className="font-['DM_Serif_Display',Georgia,serif] text-lg text-[oklch(0.25_0.02_50)]">
        Qualcosa non ha funzionato
      </p>
      <button
        onClick={onRetry}
        className="rounded-full bg-[oklch(0.55_0.22_25)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_oklch(0.55_0.22_25/0.25)] transition-all hover:bg-[oklch(0.45_0.22_25)]"
      >
        Riprova
      </button>
    </div>
  );
}

function IngredientRow({
  item,
  onRemove,
}: {
  item: Ingredient;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 transition-all">
      <span className="w-8 shrink-0 text-center text-2xl">{item.emoji}</span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[0.8125rem] font-medium">
          {item.name}
          <span
            className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${confidenceDotColor(item.confidence)}`}
          />
        </div>
        {item.detail && (
          <div className="mt-px text-xs text-[oklch(0.55_0.02_50)]">
            {item.detail}
          </div>
        )}
      </div>

      <button
        onClick={onRemove}
        aria-label="Rimuovi"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.7rem] text-[oklch(0.75_0.005_50)] transition-all hover:bg-[oklch(0.92_0.06_25)] hover:text-[oklch(0.55_0.22_25)]"
      >
        {"\u2715"}
      </button>
    </div>
  );
}

function IngredientGroup({
  category,
  items,
  onRemove,
}: {
  category: string;
  items: Ingredient[];
  onRemove: (id: string) => void;
}) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META.altro;
  const isBevande = category === "bevande";

  return (
    <div className="mb-2">
      {/* Group header */}
      <div
        className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.06em] ${
          isBevande
            ? "text-[oklch(0.58_0.14_85)]"
            : "text-[oklch(0.55_0.02_50)]"
        }`}
      >
        {meta.emoji} {meta.label}
        <span className="rounded-full bg-[oklch(0.93_0.015_85)] px-1.5 py-px text-[0.65rem] font-bold">
          {items.length}
        </span>
      </div>

      {/* Items card */}
      <div className="mx-3">
        {items.map((item, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === items.length - 1;
          const isOnly = items.length === 1;

          let rounding = "";
          if (isOnly) rounding = "rounded-2xl";
          else if (isFirst) rounding = "rounded-t-2xl";
          else if (isLast) rounding = "rounded-b-2xl";

          const borderTop = !isFirst ? "border-t border-[oklch(0.93_0.015_85)]" : "";
          const bgClass = isBevande
            ? "bg-[oklch(0.95_0.04_85)]"
            : "bg-white";
          const beverageBorder =
            isBevande && !isFirst
              ? "border-t-[oklch(0.90_0.03_85)]"
              : "";

          return (
            <div
              key={item.id}
              className={`${rounding} ${borderTop} ${bgClass} ${beverageBorder}`}
            >
              <IngredientRow
                item={item}
                onRemove={() => onRemove(item.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Main Page ---------- */

export default function ConfirmPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ConfirmContent />
    </Suspense>
  );
}

function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scanId = searchParams.get("scanId");

  const [state, setState] = useState<"loading" | "error" | "success">("loading");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  const recognize = useCallback(async () => {
    if (!scanId) {
      toast.error("Scan ID mancante");
      router.push("/scan");
      return;
    }
    setState("loading");
    try {
      const res = await fetch(`/api/scans/${scanId}/recognize`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: RecognizeResponse = await res.json();
      setIngredients(data.ingredients);
      setSummary(data.summary);
      setState("success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Errore sconosciuto";
      toast.error(`Riconoscimento fallito: ${msg}`);
      setState("error");
    }
  }, [scanId, router]);

  useEffect(() => {
    recognize();
  }, [recognize]);

  const removeIngredient = useCallback((id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const groups = groupByCategory(ingredients);
  const beverageCount = ingredients.filter(
    (i) => i.category === "bevande"
  ).length;
  const nonBeverageCount = ingredients.length - beverageCount;

  return (
    <div className="mx-auto min-h-dvh max-w-[390px] bg-[oklch(0.97_0.01_85)] pb-[calc(60px+env(safe-area-inset-bottom,0px)+5rem)]">
      {state === "loading" && <LoadingState />}
      {state === "error" && <ErrorState onRetry={recognize} />}
      {state === "success" && summary && (
        <ResultsContent
          groups={groups}
          nonBeverageCount={nonBeverageCount}
          beverageCount={beverageCount}
          onRemove={removeIngredient}
        />
      )}

      {/* Fixed CTA */}
      {state === "success" && (
        <div
          className="fixed bottom-[60px] left-1/2 z-50 w-full max-w-[390px] -translate-x-1/2 px-4 py-3"
          style={{
            background:
              "linear-gradient(to top, oklch(0.97 0.01 85) 70%, oklch(0.97 0.01 85 / 0))",
          }}
        >
          <button className="flex w-full items-center justify-center gap-2 rounded-full bg-[oklch(0.55_0.22_25)] px-6 py-4 text-[0.9375rem] font-semibold text-white shadow-[0_8px_24px_oklch(0.25_0.02_50/0.12)] transition-all hover:-translate-y-px hover:bg-[oklch(0.45_0.22_25)] hover:shadow-[0_12px_40px_oklch(0.25_0.02_50/0.15)]">
            {"\u{1F373}"} Ottieni Ricette
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Results Content ---------- */

function ResultsContent({
  groups,
  nonBeverageCount,
  beverageCount,
  onRemove,
}: {
  groups: { category: string; items: Ingredient[] }[];
  nonBeverageCount: number;
  beverageCount: number;
  onRemove: (id: string) => void;
}) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.82 0.06 50), oklch(0.72 0.12 35))",
          }}
        >
          {"\u{1F4F8}"}
        </div>
        <div>
          <h1 className="mb-px font-['DM_Serif_Display',Georgia,serif] text-lg">
            Ingredienti trovati
          </h1>
          <p className="text-xs text-[oklch(0.55_0.02_50)]">
            Trovati{" "}
            <span className="font-semibold text-[oklch(0.55_0.22_25)]">
              {nonBeverageCount} ingredienti
            </span>{" "}
            e{" "}
            <span className="font-semibold text-[oklch(0.55_0.22_25)]">
              {beverageCount} bevande
            </span>
          </p>
        </div>
      </div>

      {/* Ingredient groups */}
      {groups.map(({ category, items }) => (
        <IngredientGroup
          key={category}
          category={category}
          items={items}
          onRemove={onRemove}
        />
      ))}

      {/* Add ingredient placeholder */}
      <button className="mx-4 my-3 flex w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-[oklch(0.88_0.005_50)] px-3 py-3 text-[0.8125rem] font-medium text-[oklch(0.55_0.02_50)] transition-all hover:border-[oklch(0.65_0.18_25)] hover:bg-[oklch(0.92_0.06_25)] hover:text-[oklch(0.55_0.22_25)]">
        <span className="text-[1.1rem]">+</span>
        Aggiungi ingrediente
      </button>
    </>
  );
}
