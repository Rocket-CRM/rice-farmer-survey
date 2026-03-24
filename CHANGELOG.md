# Rice Farmer Survey — Changelog & Progress

Single reference for what changed (read this .md instead of re-explaining in prompts to save tokens).

## Current State
- **Branch**: `main`
- **Latest commit**: `a29bace` — CHANGELOG V3.2 expansion (feature: `d3c04c5` V3.2 multi-select)
- **Supabase project**: `wkevmsedchftztoolkmi` (CRM)
- **Merchant ID**: `8f67aa08-dfce-454d-bfb1-effc4ee45f1f`

---

## V3 Feedback — Section E Restructure + Image Capture (In Progress)

### Section E: Cascading Dropdowns

| # | Field | Before | After | Files |
|---|-------|--------|-------|-------|
| 1 | **E2** | Free-text "ชื่อผลิตภัณฑ์/ยี่ห้อ" | Dropdown "ชนิดของยา": ยาหญ้า, ยาแมลง, ยาเชื้อรา, ฮอร์โมนส์ | `SprayStagePanel.vue`, `constants.js` |
| 2 | **E2.1** (new) | N/A | Dropdown "แบรนด์ของยา" filtered by E2 type; hidden for ฮอร์โมนส์; "อื่นๆ" shows free-text | `SprayStagePanel.vue`, `constants.js` |
| 3 | **E3.1** (new) | Free-text "ศัตรูพืชเป้าหมาย" | Dropdown "ศัตรูพืชเป้าหมาย (หลัก)" filtered by E2 → reuses WEED/INSECT/DISEASE_OPTIONS; hidden for ฮอร์โมนส์ | `SprayStagePanel.vue`, `constants.js` |
| 4 | **E3.2** (new) | N/A | Dropdown "ศัตรูพืชเป้าหมาย (รอง)" same options as E3.1; hidden for ฮอร์โมนส์ | `SprayStagePanel.vue` |
| 5 | **E3.3** (new) | N/A | Textbox "ขนาดบรรจุภัณฑ์ที่ซื้อ (กรัม/ซีซี)" free text | `SprayStagePanel.vue` |
| 6 | **E3.4** (new) | N/A | Number "ซื้อยามาด้วยราคาเท่าไหร่ (บาท)" | `SprayStagePanel.vue` |
| 7 | **E4** | Same | Unchanged — ปริมาณที่ใช้ (มล./ไร่) | — |
| 8 | **E5** | Same | Unchanged — ความพึงพอใจ (1-5) | — |

Brand lists: 24 herbicide brands, 23 insecticide brands, 23 fungicide brands (all from customer spec). When E2 = ฮอร์โมนส์, E2.1/E3.1/E3.2 are all hidden.

Product data model changed from `{ product, amount, pest_target, satisfaction }` to `{ pesticide_type, brand, brand_other, pest_primary, pest_secondary, package_size, purchase_price, amount, satisfaction }`.

Validation updated: `pesticide_type` required, `brand` required if not hormone, `brand_other` required if brand = "other", `amount` required.

### User Image Capture (New Feature)

| # | Item | Detail | Files |
|---|------|--------|-------|
| 1 | **Signup phase** | "ถ่ายรูป / เลือกรูป" button added below พื้นที่เพาะปลูก; uses `<input type="file" accept="image/*" capture="environment">` for camera + gallery | `wwElement.vue` |
| 2 | **Profile review phase** | Same image picker; pre-populated with existing image from `user_accounts.image` | `wwElement.vue` |
| 3 | **Upload** | Images uploaded to Supabase Storage `images` bucket at `user-photos/{merchant_id}/{user_id}.{ext}`; public URL saved to `user_accounts.image` column (already exists) | `wwElement.vue` |
| 4 | **Lookup** | `lookupFarmer()` now fetches `image` column; shown in profile review | `wwElement.vue` |

No database changes needed (column + bucket + RLS already exist).

---

## V3.1 Section E — Hormone brands, purpose, free-text E3.4/E4

| # | Change | Detail |
|---|--------|--------|
| 1 | **E3.4 / E4** | Both are **free text** (not `type="number"`). Stored as strings; validation requires non-empty after trim. |
| 2 | **E2.1 for ฮอร์โมนส์** | `HORMONE_BRAND_OPTIONS` (14 brands + อื่นๆ); E2.1 now shows for **all** types including hormone. |
| 3 | **ฮอร์โมนส์ only** | Replaces E3.1/E3.2 with dropdown **วัตถุประสงค์ในการใส่** (`HORMONE_PURPOSE_OPTIONS`: เร่งราก, แตกกอดี, … + อื่นๆ) + optional text when "อื่นๆ". |
| 4 | **Validation** | Brand required for all types; hormone adds `hormone_purpose` (+ `hormone_purpose_other` if other); `purchase_price` and `amount` both required. |

Product model adds: `hormone_purpose`, `hormone_purpose_other`; `purchase_price` / `amount` default to `''`.

Files: `constants.js`, `SprayStagePanel.vue`, `wwElement.vue`.

---

## V3.2 Section E — Multi-select E3.2 + hormone purposes (`d3c04c5`)

### Summary (what changed)

| Area | Before | After |
|------|--------|--------|
| **E3.2** (non-hormone only) | One `PolarisSelect` — ศัตรูรอง **หนึ่งรายการ** | **หลายรายการ**: `PolarisCheckbox` ต่อตัวเลือก; เก็บเป็น `pest_secondary: string[]` (codes เหมือนเดิม) |
| **วัตถุประสงค์** (E2 = ฮอร์โมนส์) | One `PolarisSelect` — **หนึ่งวัตถุประสงค์** | **หลายรายการ**: checkboxes; เก็บเป็น `hormone_purpose: string[]` |
| **JSON เก่า** | `pest_secondary` / `hormone_purpose` เป็น **string ตัวเดียว** | ยังอ่านได้: `normalizeSprayProduct()` แปลง string → `[string]` |

### Non-hormone (ยาหญ้า / ยาแมลง / ยาเชื้อรา) — เงื่อนไขเดิม

- **E2, E2.1, E3.1** ไม่เปลี่ยน logic (dropdown ตามเดิม).
- **E3.2** เปลี่ยนแค่ **รูปแบบการเลือก** จาก dropdown 1 ค่า → **เลือกได้หลายค่า** (checkbox). ไม่บังคับต้องเลือกรอง (array ว่างได้).
- **E3.3–E5** เหมือนเดิม.

### Hormone — เงื่อนไข

- ต้องเลือกวัตถุประสงค์ **อย่างน้อย 1 รายการ**; ถ้าเลือก **อื่นๆ** ต้องกรอก `hormone_purpose_other`.

### Code

| # | Change | Detail |
|---|--------|--------|
| 1 | **`createEmptyProduct()`** | `pest_secondary: []`, `hormone_purpose: []` |
| 2 | **`normalizeSprayProduct(p)`** | ใน `constants.js` — รองรับ legacy string |
| 3 | **`SprayStagePanel.vue`** | `sessions` map แต่ละ product ผ่าน `normalizeSprayProduct`; `togglePestSecondary`, `toggleHormonePurpose`; import `PolarisCheckbox` + layout `.spray-panel__checkboxes` |
| 4 | **`wwElement.vue`** | `validateCurrentStep` ใช้ `normalizeSprayProduct(prod)` ก่อนเช็ค hormone array + `other` |

Files: `constants.js`, `SprayStagePanel.vue`, `wwElement.vue`.

---

## V2 Feedback Round 2 (Completed)

| # | Item | Change | Files |
|---|------|--------|-------|
| 1 | **A7/A8/A9 units on labels** | Units added in label text so they show when field is empty: A7 `(กิโลกรัม/ไร่)`, A8/A9 `(บาท/ตัน/เกวียน)`. `suffix` kept for in-input display. | `wwElement.vue` |
| 2 | **Weed grouping** | WEED_OPTIONS merged into ~20 grouped rows; one checkbox per group (e.g. "หญ้าข้าวนก, หญ้าพุ่มพวง, หญ้าคอมมิวนิสต์"). Removed `group` and `--group-start` from AssessmentMatrix. | `constants.js`, `AssessmentMatrix.vue` |
| 3 | **Rating colors context-aware** | `RatingScale` has `reversed` prop: default 1=green/5=red (damage); reversed 1=red/5=green (satisfaction). E5 satisfaction uses `:reversed="true"`. | `RatingScale.vue`, `SprayStagePanel.vue` |
| 4 | **Section E per-field errors** | Step 5 validation sets keys `spray_{stageKey}_{s}_{p}_product` and `_amount`. `SprayStagePanel` receives `errors` prop and shows `:error` on E2 (product) and E4 (amount) PolarisTextField. | `wwElement.vue`, `SprayStagePanel.vue` |
| 5 | **E3/E4 order** | E3 = ศัตรูพืชเป้าหมาย (target pest), E4 = ปริมาณที่ใช้ (amount). Order in UI and data unchanged after fix. | `SprayStagePanel.vue` |

Other V2 work already in codebase: duplicate disease "โรคใบขีดโน้มตาล" removed from DISEASE_OPTIONS; Section E restructured to sessions → products (E1 = spray count, each session has multiple products with E2–E5).

---

## V1 Feedback Fixes (Completed — commit `5a3c572`)

Based on customer feedback PDF with 8 items.

| # | Item | What changed | Files |
|---|------|-------------|-------|
| 1 | Farmer profile visibility & editing | Added `profile_review` phase between tel lookup and survey. Existing farmers see editable name, address, crop, area before starting survey. | `wwElement.vue` |
| 2 | Rice variety dropdown | Replaced free-text input with `PolarisSelect` dropdown using exact variety list + "อื่นๆ โปรดระบุ" option | `VarietyRepeater.vue`, `constants.js` |
| 3 | Unit labels (A8/A9, harvest days) | Added `suffix="บาท/ตัน/เกวียน"` to A8/A9, `suffix="วัน"` to harvest days | `wwElement.vue`, `VarietyRepeater.vue` |
| 4 | Spray amount numeric-only | E4 amount field changed to `type="number"` with `suffix="มล./ไร่"` | `SprayStagePanel.vue` |
| 5 | Block incomplete submissions | Added `validateAllSteps()` before submit; validates spray details (product, type, amount) | `wwElement.vue` |
| 6 | Reset confirmation modal | Cancel now shows confirmation modal before resetting survey | `wwElement.vue` |
| 7 | Edit button visibility | Changed Step 6 review edit buttons from `variant="plain"` to `variant="secondary"` | `wwElement.vue` |
| 8 | Success modal after submission | Shows success modal with submission ID instead of immediate reset | `wwElement.vue` |

### Not implemented (deferred to V2)
- Screenshot-based feedback items (additional UI refinements from images)

---

## Address Data & Profile Save Bugfix (Completed — commit `1448748`)

Root cause: `user_address` table stores **IDs** (e.g., `city="53"`) not text labels (e.g., `"จ.อุตรดิตถ์"`). The code was reading/writing text labels.

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Address dropdowns empty on profile review | `fetchFarmerProfile()` matched by label instead of ID (`provinces.find(p => p.label === "53")` → never matches) | Match by `value`: `provinces.find(p => p.value === storedProvinceId)` |
| Address save writes wrong format | Saved text labels to `city`/`district`/`subdistrict` columns | Now saves IDs: `String(profileData.province_id)` |
| Missing `code` column on INSERT | `user_address.code` is NOT NULL, no default. INSERT omitted it → silent failure | Added `getNextAddressCode()` helper using `MAX(code)+1` |
| No `subdistrict_id` tracking | Template used fragile reverse-lookup by label | Added `subdistrict_id` to both `signupData` and `profileData` |
| Silent error handling | Supabase errors logged to console only, user saw false success | Errors collected and surfaced via `showNotification()` |
| Crop/area skipped when no profile submission | If `profileSubmissionId` was null, crop/area edits were discarded | Now creates new `form_submissions` + `form_responses` INSERT |
| Signup INSERT also used text labels | Same wrong format in `validateAndCreateUser()` | Fixed to save IDs + include `code` |

---

## Database Changes (Applied manually in Supabase SQL Editor)

### 2026-03-12: Add RLS policies for `user_address`

`user_address` had RLS enabled but **zero policies** — all operations silently denied.

```sql
CREATE POLICY "user_address_merchant_read"
  ON public.user_address FOR SELECT TO public
  USING (merchant_id = get_current_merchant_id());

CREATE POLICY "user_address_merchant_insert"
  ON public.user_address FOR INSERT TO public
  WITH CHECK (merchant_id = get_current_merchant_id());

CREATE POLICY "user_address_merchant_update"
  ON public.user_address FOR UPDATE TO public
  USING (merchant_id = get_current_merchant_id())
  WITH CHECK (merchant_id = get_current_merchant_id());

CREATE POLICY "user_address_service_role_access"
  ON public.user_address FOR ALL TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
```

### 2026-03-12: Add UPDATE policy for `user_accounts`

`user_accounts` had SELECT and INSERT policies but **no UPDATE policy** — name edits silently did nothing.

```sql
CREATE POLICY "user_accounts_merchant_update"
  ON public.user_accounts FOR UPDATE TO public
  USING (merchant_id = get_current_merchant_id())
  WITH CHECK (merchant_id = get_current_merchant_id());
```

---

## Key Reference

### Database tables used by this component

| Table | Operations | RLS Status |
|-------|-----------|------------|
| `user_accounts` | SELECT, INSERT, UPDATE | ✅ Policies exist |
| `user_address` | SELECT, INSERT, UPDATE | ✅ Policies added 2026-03-12 |
| `form_submissions` | SELECT, INSERT | ✅ Policies exist |
| `form_responses` | SELECT, INSERT, UPDATE | ✅ Policies exist |
| `address_th_province` | SELECT | ✅ Public read |
| `address_th_district` | SELECT | ✅ Public read |
| `address_th_subdistrict` | SELECT | ✅ Public read |

### Address data format in `user_address`

The `city`, `district`, `subdistrict` columns store **IDs as strings**, NOT text names:
- `city` = province ID (e.g., `"53"` = จ.อุตรดิตถ์)
- `district` = district ID (e.g., `"5301"`)
- `subdistrict` = subdistrict ID (e.g., `"530110"`)

These map to `address_th_province.id`, `address_th_district.id`, `address_th_subdistrict.id` (all TEXT type).

### RLS helper functions
- `get_current_merchant_id()` — reads `x-merchant-id` header (Priority 1), or JWT claims, or user lookup
- `get_current_user_id()` — reads custom header or `auth.uid()`

### Supabase client auth
The component creates a Supabase client with:
- URL from `props.content.supabaseUrl`
- Anon key from `props.content.supabaseAnonKey`
- Custom headers: `x-merchant-id` (always), `Authorization: Bearer <token>` (if `accessToken` prop provided)
