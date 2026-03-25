# WhatsCookin — Product Requirements Document

**Author:** AIRchetipo
**Date:** 2026-03-25
**Version:** 1.0

---

## Elevator Pitch

> For **everyone who opens the fridge and wonders "what can I make with this?"**, who has the problem of **food waste, lack of inspiration, and no idea what drink goes with dinner**, **WhatsCookin** is an **AI-powered recipe and pairing assistant** that **turns a photo of your ingredients into recipes, beverage pairings, and a cultural clash score — all shareable on a social feed**. Unlike **Supercook, Yummly, or MyFridgeFood**, our product **combines AI image recognition, beverage pairing, a viral cultural clash scoring system, and a social timeline where users share and vote on each other's creations**.

---

## Vision

An AI kitchen assistant that transforms what you have at home into recipes and perfect pairings — with a social and cultural twist that makes it viral.

### Product Differentiator

No existing recipe app combines all three pillars:
1. **Flexible Ingredient Input** — Snap a photo for AI recognition or type ingredients manually — two paths to the same result, zero friction
2. **Cultural Clash Score** — An ironic-yet-educational scoring system that flags when your recipe violates culinary traditions ("NONNA ALERT! 👵🏻🚨 Score: 92/100 — Parmigiano on seafood pasta in Italy")
3. **Social Virality Loop** — Share your scans, vote on others' creations, discover what the community is cooking. The cultural clash score is inherently shareable and meme-worthy

---

## User Personas

### Persona 1: Marco

**Role:** Software Developer, single
**Age:** 28 | **Background:** Lives alone in Milan, works long hours, limited cooking skills but curious. Eats out too much and wastes food regularly.

**Goals:**
- Quick dinner ideas with whatever is in the fridge after a long day
- Discover interesting food-drink pairings without being a sommelier
- Have fun with the social/cultural features, share absurd combos with friends

**Pain Points:**
- Gets home late and stares at the fridge with no ideas
- Throws away expired food weekly
- Recipe apps require too much manual input — he gives up halfway
- Doesn't know what drink goes with what

**Behaviors & Tools:**
- Lives on his phone, uses Instagram and Reddit daily
- Loves gamification and scoring systems
- Prefers visual, minimal UIs — zero patience for clutter

**Motivations:** Convenience, anti-waste guilt, social entertainment
**Tech Savviness:** High — early adopter, comfortable with AI tools

#### Customer Journey — Marco

| Phase | Action | Thought | Emotion | Opportunity |
|---|---|---|---|---|
| Awareness | Sees a friend's "NONNA ALERT 👵🏻" post on Instagram with a crazy cultural clash score | "Lol what is this app?" | Amused, curious | Viral social sharing is the primary acquisition channel |
| Consideration | Downloads the app, sees it's free, notices the photo scan feature | "Wait, I just take a photo and it tells me what to cook?" | Intrigued, slightly skeptical | Onboarding must show the magic moment (photo → recipes) in < 30 seconds |
| First Use | Opens fridge, snaps a photo, gets 4 recipe suggestions with a Cultural Clash Score of 73 | "This actually works! And the Nonna score is hilarious" | Delighted, entertained | First scan must feel magical — fast AI response, fun cultural badge |
| Regular Use | Scans 3-4 times a week, shares his best/worst cultural scores, votes on others' posts | "I've barely thrown away food this month" | Satisfied, engaged | Push seasonal bonus badges to encourage trying new things |
| Advocacy | Posts his "worst" cultural clash score (97/100) on social media, friends download | "You HAVE to try this app, my score was insane" | Proud, entertained | Make sharing frictionless — pre-generated shareable cards |

---

### Persona 2: Giulia

**Role:** Working mother, food enthusiast
**Age:** 42 | **Background:** Lives in Naples with husband and two kids. Manages weekly grocery shopping, hates wasting food. Amateur foodie who enjoys wine pairing on Friday nights.

**Goals:**
- Use up all the week's groceries before they expire
- Find varied recipes that the whole family will eat
- Discover wine-dinner pairings for date nights and weekend dinners
- Have fun with the cultural features — share laughs in the family WhatsApp group

**Pain Points:**
- Kids are picky, needs recipes that work for the whole family
- Buys too much and throws away food every week
- Doesn't have time to browse recipe blogs for 30 minutes
- Wine pairing feels intimidating and "snobby"

**Behaviors & Tools:**
- Uses WhatsApp constantly, shares content in family/friends groups
- Follows food influencers on Instagram
- Prefers clear, no-nonsense interfaces
- Cooks 5-6 times a week, knows her way around the kitchen

**Motivations:** Family well-being, anti-waste, discovering new flavors, social fun
**Tech Savviness:** Medium — comfortable with apps but not an early adopter

#### Customer Journey — Giulia

| Phase | Action | Thought | Emotion | Opportunity |
|---|---|---|---|---|
| Awareness | A friend in her WhatsApp group shares a WhatsCookin post with a funny cultural clash badge | "Che cos'e' sta app? La Nonna Alert mi fa morire 😂" | Amused, curious | WhatsApp sharing must be one-tap with rich preview |
| Consideration | Downloads the app, sets up dietary preferences for the family (no shellfish for the kids) | "Ok if it saves me time planning dinner, I'm in" | Hopeful, practical | Onboarding should include family preference setup |
| First Use | Photos the fridge on Sunday, gets 5 recipe ideas for the week with seasonal bonuses | "3 of these use the zucchini that's about to go bad — perfect" | Relieved, impressed | Highlight ingredients close to expiry (Growth feature) |
| Regular Use | Scans twice a week, uses wine pairing for Friday dinners, shares best finds in her group | "Friday: pasta alla Norma + Nero d'Avola. WhatsCookin says 94/100 pairing!" | Confident, delighted | Wine pairing should feel accessible, not snobby |
| Advocacy | Recommends the app at school pickup, shows the cultural scores to other moms | "Le ragazze impazziscono per i punteggi della Nonna" | Proud, social | Referral program or shareable "My WhatsCookin Stats" card |

---

## Brainstorming Insights

> Key discoveries and alternative directions explored during the inception session.

### Assumptions Challenged

1. **"Users know what they have at home"** — Challenged by Costanza. The real problem might be inventory management itself. For MVP, we skip this (photo AI handles the "discovery" moment), but Growth could include continuous pantry tracking.

2. **"All input methods should be in MVP"** — Manual list, barcode scan, and photo AI are each a project on their own. Decision: **photo AI only for MVP** — highest wow factor, most aligned with the viral loop. Barcode and manual input move to Growth.

3. **"The app is about recipes"** — The real hook isn't recipes (everyone has those) — it's the **Cultural Clash Score** and the **social sharing loop**. The recipe is the vehicle, the cultural score is the entertainment, and the social feed is the retention engine.

### New Directions Discovered

1. **Cultural Clash Score as the viral engine** — The team realized this feature is the real differentiator. It's inherently shareable, meme-worthy, and creates conversation. The ironic tone ("NONNA ALERT! 👵🏻") combined with educational context makes it both fun and valuable.

2. **Seasonality Bonus** — Emerged during the session: recipes using seasonal ingredients get a visible bonus/badge. This encourages users to cook seasonally, reduces costs, and adds a gamification layer.

3. **Social-first, not recipe-first** — The pivot from "recipe app with social features" to "social food app with AI recipes" happened when the user insisted on the timeline being in the MVP. The viral loop (scan → cook → post → vote → discover → re-scan) is the core growth engine.

---

## Product Scope

### MVP — Minimum Viable Product

1. **Scan & AI Recognition** — User takes/uploads a photo → OpenRouter AI vision model identifies ingredients and beverages with confidence scores
2. **Manual Ingredient Entry** — User can manually search and select ingredients from a categorized catalog, as an alternative or complement to photo scanning
3. **Confirm & Edit** — User reviews recognized/selected items, can correct misidentifications, add missing items, or remove false positives
3. **Recipe Suggestions** — AI generates 3-5 recipes using recognized ingredients (partial matches allowed — "you have 4 of 6 ingredients")
4. **Beverage Pairing** — For each recipe, suggests the best beverage pairing from what's available (wine, juice, energy drink, etc.)
5. **Cultural Clash Score** — Each recipe gets a 0-100 score indicating how much it violates culinary traditions. Ironic badge display ("NONNA ALERT! 👵🏻🚨") with educational explanation underneath
6. **Seasonality Bonus** — Recipes using seasonal ingredients receive a visible bonus badge, encouraging seasonal cooking
7. **User Profile** — Extends existing boilerplate auth profile with: dietary restrictions (vegetarian, vegan, gluten-free, lactose-free), religious dietary laws (halal, kosher, Hindu no-beef), personal taste preferences, and specific allergies
8. **Social Timeline** — Public feed where users manually share their scans, recipes, and results. Users decide what to post (not auto-published)
9. **Voting** — Simple like (heart) on other users' posts
10. **Scan History** — Personal history of past scans with generated recipes and pairings

### Growth Features (Post-MVP)

- **"Unlikely Pairing" Score** — A creativity ranking for unusual ingredient combinations ("How crazy is this combo?")
- **Barcode Scanning** — Scan product barcodes via Open Food Facts DB for precise ingredient identification
- **Expiry Notifications** — "Use the milk before Thursday" reminders based on scan history
- **Comments & Interactions** — Conversations under social posts
- **Leaderboard** — Community ranking: top chefs, most creative combos, highest cultural clash survivors

### Vision (Future)

- **Weekly Meal Planning** — AI-generated meal plans based on current pantry contents
- **Shopping List Integration** — Auto-generate shopping lists for missing ingredients
- **Continuous Pantry Recognition** — Periodic photos to keep a running pantry inventory
- **Global Cultural Database** — Extended cultural rules covering cuisines worldwide (Japanese, Indian, Mexican, etc.)

---

## Technical Architecture

> **Proposed by:** Leonardo (Architect)

### System Architecture

The application follows a **Modular Monolith** pattern built on the existing Next.js 15 App Router boilerplate. This project uses an existing boilerplate with auth, database, and UI already configured. Rebuilding would waste time and introduce inconsistencies.

**Architectural Pattern:** Modular Monolith (Next.js App Router with domain-organized modules)

**Main Components:**
- **Scan Module** — Camera/upload UI, image processing, AI vision integration via OpenRouter, and manual ingredient search/selection
- **Recipe Module** — Recipe generation, display, cultural scoring, seasonality badges
- **Pairing Module** — Beverage pairing logic and display
- **Social Module** — Timeline feed, post creation, voting system
- **Profile Module** — User preferences (diet, religion, tastes, allergies)
- **AI Service Layer** — Centralized OpenRouter client handling vision, recipe generation, pairing suggestions, and cultural scoring

### Technology Stack

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| Language | TypeScript | 5.x | Type safety, already configured in boilerplate |
| Frontend Framework | Next.js | 15.x | App Router with SSR/SSG, already configured in boilerplate |
| UI Framework | Tailwind CSS + shadcn/ui | v4 / latest | Already configured, provides consistent design system |
| Database | PostgreSQL | via Supabase | Already configured, managed by Supabase |
| ORM | Prisma | latest | Already configured, type-safe DB access |
| Auth | Supabase Auth | latest | GitHub & Google OAuth already implemented |
| Storage | Supabase Storage | latest | For user-uploaded food photos |
| AI Provider | OpenRouter API | latest | Budget-friendly AI proxy — routes to cheapest vision/LLM model (Gemini Flash, Llama Vision, etc.) |
| Testing | Jest + React Testing Library | latest | Standard for Next.js projects |

### Development Environment

Local development uses `npm run dev` with Turbopack (already configured). The AI features require an OpenRouter API key set as an environment variable.

**Required tools:** Node.js 18+, npm, OpenRouter account (free tier available)

**New environment variables:**
- `OPENROUTER_API_KEY` — OpenRouter API key for AI vision and LLM calls

#### OpenRouter Setup Guide

1. Go to [openrouter.ai](https://openrouter.ai) and create a free account
2. Navigate to **Keys** in the dashboard
3. Click **Create Key**, give it a name (e.g., "WhatsCookin Dev")
4. Copy the API key and add it to your `.env.local`:
   ```
   OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx
   ```
5. Add credits: OpenRouter uses pay-per-token pricing. $5 of credits will last a long time for development
6. Recommended models for vision: `google/gemini-2.0-flash-exp` (cheapest), `meta-llama/llama-3.2-11b-vision-instruct` (free tier)

### CI/CD & Deployment

**Build tool:** npm (Next.js built-in)

**Pipeline:** GitHub Actions or Vercel auto-deploy on push

**Deployment:** Vercel (natural fit for Next.js — zero-config deployment)

**Target infrastructure:** Vercel (frontend + API routes) + Supabase (database + auth + storage)

### Architecture Decision Records (ADR)

1. **ADR-001: OpenRouter over direct OpenAI/Google API** — OpenRouter acts as a proxy, allowing model switching without code changes. If Gemini Flash is cheapest today and Llama Vision is cheapest tomorrow, we switch via config. This protects against vendor lock-in and optimizes cost.

2. **ADR-002: AI-generated recipes over recipe database** — Instead of maintaining a recipe database (millions of entries, licensing issues), we use LLM generation. Pros: infinite variety, no data maintenance, handles any ingredient combo. Cons: occasional hallucination, no guaranteed consistency. Mitigation: cultural score acts as a quality/sanity check.

3. **ADR-003: Cultural Clash Score — hybrid approach** — Hardcoded rules for well-known cultural norms (Parmigiano + seafood in Italy, pork in halal cuisine, etc.) combined with LLM evaluation for edge cases. Hardcoded rules are deterministic and reliable; LLM handles the long tail.

4. **ADR-004: Manual social posting over auto-post** — Users explicitly choose what to share. This respects privacy (not everyone wants to broadcast their sad Tuesday dinner) and increases post quality (only "interesting" scans get shared).

5. **ADR-005: Dual MVP input — Photo AI + Manual** — Photo AI is the wow-factor entry point, but manual input is essential for users who prefer typing, have poor camera lighting, or want to add pantry staples not visible in the photo. Both paths converge on the same ingredient confirmation screen. Barcode scanning remains a Growth feature.

---

## Functional Requirements

### Scan & Recognition

- **FR1:** The user can take a photo using the device camera or upload an existing image from the gallery
- **FR2:** The system sends the image to OpenRouter (vision model) and receives a list of identified ingredients and beverages with confidence scores (0-1)
- **FR3:** The system displays recognized items grouped by category (vegetables, meat, dairy, beverages, pantry staples, etc.)

### Manual Ingredient Entry

- **FR4:** The user can choose to enter ingredients manually instead of (or in addition to) taking a photo
- **FR5:** The system provides a searchable ingredient catalog with autocomplete, organized by category (vegetables, meat, dairy, beverages, pantry staples, etc.)
- **FR6:** The user can add quantities and select the ingredient type (fresh, frozen, canned, etc.)

### Confirm & Edit (shared by both input methods)

- **FR7:** The user can review all ingredients (from photo AI and/or manual entry) in a unified list
- **FR8:** The user can confirm, remove, or edit any item
- **FR9:** The user can manually add ingredients not recognized by the AI or missing from the list

### Recipe Suggestions

- **FR10:** After ingredient confirmation, the system generates 3-5 recipe suggestions via OpenRouter LLM
- **FR11:** Recipes may use a subset of available ingredients (partial match) — each recipe shows which ingredients are used and which are missing
- **FR12:** Recipes respect the user's dietary preferences, religious restrictions, and allergies as configured in their profile
- **FR13:** Each recipe includes: title, short description, ingredient list (with quantities), step-by-step instructions, estimated preparation time, and difficulty level

### Beverage Pairing

- **FR14:** For each suggested recipe, the system recommends the best beverage pairing from the beverages identified in the scan
- **FR15:** Pairings include a compatibility score (0-100) and a short explanation of why the pairing works
- **FR16:** If no suitable beverage was scanned, the system suggests a general pairing recommendation ("This would go great with a dry white wine")

### Cultural Clash Score

- **FR17:** Each recipe receives a Cultural Clash Score (0-100) where 0 = perfectly traditional and 100 = maximum cultural transgression
- **FR18:** The score is displayed as an ironic visual badge (e.g., "NONNA ALERT! 👵🏻🚨", "TRADITION APPROVED ✅", "CULINARY REBEL 🔥")
- **FR19:** Below the badge, an educational explanation describes which cultural norm is being challenged and why (e.g., "In Italian cuisine, grated cheese is traditionally never combined with seafood pasta. This dates back to...")
- **FR20:** The scoring system considers the user's configured cultural context (e.g., Italian, Japanese, Indian) to apply relevant cultural rules

### Seasonality Bonus

- **FR21:** The system identifies which scanned ingredients are currently in season (based on user's region/hemisphere)
- **FR22:** Recipes that primarily use seasonal ingredients receive a visible "Seasonal 🌿" badge
- **FR23:** Seasonal recipes are prioritized/highlighted in the suggestion list

### User Profile (Extends existing boilerplate)

- **FR24:** The user can configure dietary restrictions: vegetarian, vegan, gluten-free, lactose-free
- **FR25:** The user can configure religious dietary laws: halal, kosher, Hindu (no beef), or none
- **FR26:** The user can specify personal taste preferences: disliked ingredients, spice tolerance level, cuisine preferences
- **FR27:** The user can list specific allergies (free-text input with common suggestions)
- **FR28:** Profile preferences are used to filter AI-generated recipes and flag incompatible suggestions

### Social Timeline

- **FR29:** The app displays a public feed of posts from all users, sorted by recency (newest first)
- **FR30:** A user can create a post by selecting a past scan/recipe and optionally adding a photo of the finished dish and a text comment
- **FR31:** Each post in the feed shows: user avatar/name, recipe title, Cultural Clash Score badge, seasonality badge (if applicable), photo (if added), and like count
- **FR32:** The feed supports infinite scroll pagination

### Voting

- **FR33:** Any authenticated user can "like" (heart) a post in the feed — one like per user per post
- **FR34:** The like count is displayed on each post and updates in real-time (or near real-time)
- **FR35:** A user can unlike a previously liked post

### Scan History

- **FR36:** The user can view a chronological list of their past scans
- **FR37:** Each scan entry shows: date, thumbnail of the original photo, list of recognized ingredients, and links to generated recipes
- **FR38:** The user can re-open a past scan to view its recipes and pairings

---

## Non-Functional Requirements

### Security

- **NFR1:** OpenRouter API key must be stored server-side only (environment variable), never exposed to the client
- **NFR2:** User-uploaded images must be stored in Supabase Storage with row-level security (users can only access their own images unless shared via a post)
- **NFR3:** All AI API calls must be made from Next.js API routes (server-side), never from the client
- **NFR4:** User dietary/religious preferences are private by default and never displayed on social posts
- **NFR5:** Rate limiting on scan API routes to prevent abuse (e.g., max 20 scans/day per user)

### Integrations

- **NFR6:** OpenRouter API integration for image recognition (vision models) and text generation (LLM models)
- **NFR7:** Supabase Storage integration for user photo uploads
- **NFR8:** Supabase Auth integration for user authentication (already implemented in boilerplate)
- **NFR9:** Prisma/PostgreSQL for all persistent data storage

### Performance

- **NFR10:** AI image recognition should return results within 5 seconds of upload
- **NFR11:** Recipe generation should complete within 8 seconds
- **NFR12:** Social feed should load initial posts within 2 seconds
- **NFR13:** Image uploads should support files up to 10MB

### Accessibility

- **NFR14:** All interactive elements must be keyboard navigable
- **NFR15:** Cultural Clash Score badges must have text alternatives (not rely solely on emoji/color)
- **NFR16:** Image upload must support both camera capture and file selection (accessibility for users who can't use camera)

---

## Next Steps

1. **UX Design** — Define detailed interaction flows and wireframes for MVP features. Create Figma mockups using the Figma MCP connector with minimal & clean design language.
2. **Backlog** — Decompose functional requirements into epics and user stories using `/airchetipo-backlog`
3. **Implementation Planning** — Use `/airchetipo-plan` for sprint-level technical planning of each user story
4. **OpenRouter Setup** — Create account and configure API key following the guide in this PRD
5. **Validation** — Test AI recognition accuracy with real fridge photos, validate cultural score rules with diverse users

---

_PRD generated via AIRchetipo Product Inception — 2026-03-25_
_Session conducted by: the user with the AIRchetipo team (Andrea, Costanza, Leonardo, Livia, Emanuele)_
