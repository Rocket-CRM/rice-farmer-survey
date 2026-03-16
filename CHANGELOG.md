# Rice Farmer Survey — Changelog & Progress

Single reference for what changed (read this .md instead of re-explaining in prompts to save tokens).

## Current State
- **Branch**: `main`
- **Latest commit**: (see latest section below)
- **Supabase project**: `wkevmsedchftztoolkmi` (CRM)
- **Merchant ID**: `8f67aa08-dfce-454d-bfb1-effc4ee45f1f`

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
