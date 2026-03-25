const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
const MODEL = "google/gemini-2.0-flash-001"
const TIMEOUT_MS = 30000
const RETRY_DELAY_MS = 1000

const SYSTEM_PROMPT = `Sei un assistente specializzato nel riconoscimento di ingredienti alimentari e bevande da fotografie.

Analizza l'immagine e identifica TUTTI gli ingredienti e le bevande visibili.

Rispondi SOLO con JSON valido, senza testo aggiuntivo, con questa struttura:
{
  "ingredients": [
    {
      "name": "nome in italiano",
      "emoji": "emoji appropriata",
      "category": "una tra: verdure, carne, pesce, latticini, bevande, dispensa, altro",
      "confidence": 0.0-1.0,
      "detail": "dettaglio opzionale (es. varietà, taglio, marca)"
    }
  ]
}

Regole:
- Usa nomi in italiano
- Assegna una categoria tra: verdure, carne, pesce, latticini, bevande, dispensa, altro
- Assegna un livello di confidenza tra 0.0 e 1.0
- Includi un'emoji rappresentativa per ogni ingrediente
- Il campo "detail" è opzionale, usalo solo se utile`

// --- Types ---

export type IngredientCategory =
  | "verdure"
  | "carne"
  | "pesce"
  | "latticini"
  | "bevande"
  | "dispensa"
  | "altro"

export interface AiIngredient {
  name: string
  emoji: string
  category: IngredientCategory
  confidence: number
  detail?: string
}

export interface RecognizeResult {
  ingredients: AiIngredient[]
  model: string
  durationMs: number
}

// --- Helpers ---

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables")
  }
  return key
}

function buildRequestBody(imageUrl: string) {
  return {
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: imageUrl },
          },
          {
            type: "text",
            text: "Identifica tutti gli ingredienti e le bevande visibili in questa foto.",
          },
        ],
      },
    ],
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("OpenRouter request timed out", { cause: err })
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

function isRetryable(status: number): boolean {
  return status === 429 || status >= 500
}

async function callOpenRouter(body: object): Promise<Response> {
  const apiKey = getApiKey()
  const init: RequestInit = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }

  const first = await fetchWithTimeout(OPENROUTER_URL, init)
  if (first.ok || !isRetryable(first.status)) return first

  await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
  return fetchWithTimeout(OPENROUTER_URL, init)
}

const VALID_CATEGORIES = new Set<string>([
  "verdure", "carne", "pesce", "latticini", "bevande", "dispensa", "altro",
])

function validateIngredient(item: unknown): AiIngredient {
  const obj = item as Record<string, unknown>
  if (typeof obj.name !== "string" || !obj.name) {
    throw new Error("Ingredient missing 'name'")
  }
  if (typeof obj.confidence !== "number" || obj.confidence < 0 || obj.confidence > 1) {
    throw new Error(`Ingredient '${obj.name}' has invalid confidence`)
  }
  const category = VALID_CATEGORIES.has(obj.category as string)
    ? (obj.category as IngredientCategory)
    : "altro"

  return {
    name: obj.name,
    emoji: typeof obj.emoji === "string" ? obj.emoji : "🍽",
    category,
    confidence: obj.confidence,
    detail: typeof obj.detail === "string" ? obj.detail : undefined,
  }
}

function parseContent(raw: string): AiIngredient[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    throw new Error("Failed to parse OpenRouter JSON response", { cause: err })
  }

  const obj = parsed as Record<string, unknown>
  if (!Array.isArray(obj.ingredients)) {
    throw new Error("OpenRouter response missing 'ingredients' array")
  }
  return obj.ingredients.map(validateIngredient)
}

// --- Public API ---

export async function recognizeIngredients(
  imageUrl: string,
): Promise<RecognizeResult> {
  const start = Date.now()
  const body = buildRequestBody(imageUrl)
  const response = await callOpenRouter(body)

  if (!response.ok) {
    const text = await response.text().catch(() => "unknown")
    throw new Error(
      `OpenRouter API error ${response.status}: ${text}`,
    )
  }

  const json = await response.json()
  const content = json.choices?.[0]?.message?.content ?? ""
  const ingredients = parseContent(content)

  return {
    ingredients,
    model: MODEL,
    durationMs: Date.now() - start,
  }
}
