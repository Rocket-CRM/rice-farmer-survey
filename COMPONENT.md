# Rice Farmer Survey Component

A WeWeb custom component (Vue 3, Composition API) for conducting rice farmer field interviews. Built with the Polaris design system via `polaris-weweb-styles`. All UI labels are in Thai. The target users are field interviewers using tablets or phones.

## Component Flow

The component operates in three sequential phases, all within a single embedded UI:

```
Phase 1: TEL LOOKUP
  Interviewer enters farmer's phone number → lookup in user_accounts

    ├─ Found → show farmer name, proceed to Phase 3
    └─ Not found → proceed to Phase 2

Phase 2: SIGNUP (new farmers only)
  Collect: name, province/district/subdistrict (cascading selects), crops, area
  On "Next": create user_accounts + user_address + USER_PROFILE immediately
  Errors surface here so interviewer can retry before starting the survey

Phase 3: SURVEY (6 steps)
  Step 1: Section A — General farm info (age, area, varieties, yield, prices)
  Step 2: Section B — Weed assessment (39 items)
  Step 3: Section C — Insect/pest assessment (9 items)
  Step 4: Section D — Disease assessment (11 items)
  Step 5: Section E — Pesticide usage (spray apps per growth stage + costs)
  Step 6: Review & Submit

  On submit:
    1. Farmer already exists (found in Phase 1 or created in Phase 2)
    2. Create RICE_BIGGROWER_2026 form_submission + form_responses
    3. Show success toast, reset to Phase 1
```

## WeWeb Configuration

### Properties (bound in WeWeb editor)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `supabaseUrl` | Text | `https://wkevmsedchftztoolkmi.supabase.co` | Supabase project URL |
| `supabaseAnonKey` | Text | *(prefilled)* | Supabase anon key |
| `accessToken` | Text | *(bind to admin JWT)* | JWT of the logged-in interviewer/admin |
| `userId` | Text | *(bind to admin user ID)* | UUID of the interviewer (for `ref_userid` tracking) |
| `source` | Text | `field_interview` | Source identifier stored on submissions |

### Trigger Events

| Event | Payload | When |
|-------|---------|------|
| `survey-completed` | `{ submissionId, farmerId, isNewUser }` | Successful submission |
| `survey-closed` | `{}` | User clicks cancel |
| `error` | `{ message }` | Any error during submission |
| `phase-changed` | `{ phase }` | Transition between tel_lookup/signup/survey |
| `step-changed` | `{ step }` | Navigation between survey steps 1-6 |

### Exposed Actions

| Action | Description |
|--------|-------------|
| `reset` | Programmatically reset the entire component to Phase 1 |

### Internal Variables

| Variable | Type | Description |
|----------|------|-------------|
| `currentPhase` | string | `tel_lookup`, `signup`, or `survey` |
| `currentStep` | number | 1-6 within the survey phase |
| `farmerName` | string | Name of the found/registered farmer |
| `isSubmitting` | boolean | True during submission API calls |

## Backend Connection

### Supabase Client

The component creates its own `@supabase/supabase-js` client using the provided `supabaseUrl`, `supabaseAnonKey`, and `accessToken`. Every request includes the header `x-merchant-id` set to the hardcoded Syngenta merchant ID so that Row Level Security (RLS) resolves correctly via the `get_current_merchant_id()` Postgres function, regardless of which merchant the admin user belongs to.

```
Authorization: Bearer <accessToken>
x-merchant-id: 8f67aa08-dfce-454d-bfb1-effc4ee45f1f
```

### Tables Read

| Table | Purpose | When |
|-------|---------|------|
| `user_accounts` | Lookup farmer by phone + merchant_id | Phase 1 tel search |
| `address_th_province` | Province dropdown options | Phase 2 on mount |
| `address_th_district` | District dropdown (filtered by province_id) | Phase 2 on province select |
| `address_th_subdistrict` | Subdistrict dropdown (filtered by district_id) | Phase 2 on district select |

### Tables Written (on signup — Phase 2 "Next" click)

| Table | What |
|-------|------|
| `user_accounts` | `INSERT` with merchant_id, tel, firstname, lastname, is_signup_form_complete |
| `user_address` | `INSERT` with user_id, merchant_id, city, district, subdistrict |
| `form_submissions` | `INSERT` for USER_PROFILE form |
| `form_responses` | `INSERT` crop (array_value) + area (text_value) |

### Tables Written (on survey submit — Step 6)

| Table | What |
|-------|------|
| `form_submissions` | `INSERT` for RICE_BIGGROWER_2026 survey |
| `form_responses` | `INSERT` all survey field responses (14-19 rows) |

### Phone Number Normalization

All phone inputs are normalized to `+66XXXXXXXXX` format before any DB operation:
- `0812345678` → `+66812345678`
- `66812345678` → `+66812345678`
- `+66812345678` → `+66812345678` (no change)

## What Is Hardcoded vs Dynamic

### Hardcoded in `src/constants.js`

These values are baked into the component and match existing database records:

| Constant | Value | Purpose |
|----------|-------|---------|
| `MERCHANT_ID` | `8f67aa08-dfce-454d-bfb1-effc4ee45f1f` | Syngenta merchant |
| `FORM_ID` | `622bed39-c4df-4d5d-9c4b-2ac4873104fa` | RICE_BIGGROWER_2026 form template |
| `USER_PROFILE_FORM_ID` | `a0000000-0000-0000-0000-000000000001` | Syngenta USER_PROFILE form |
| `CROP_FIELD_ID` | `c0000000-0000-0000-0000-000000000001` | Crop field in USER_PROFILE |
| `AREA_FIELD_ID` | `c0000000-0000-0000-0000-000000000002` | Area field in USER_PROFILE |
| `FIELDS` | 19 field objects | Every survey field's UUID, type, validation |

All **survey field IDs** (A1-A9, B, C, D, E1-E7) are hardcoded UUIDs matching rows in `form_fields` for the RICE_BIGGROWER_2026 template. The component does not fetch the form structure at runtime.

All **option lists** are also hardcoded:
- 12 months (A3)
- 39 weed species (B1)
- 9 insect/pest species (C1)
- 11 disease types (D1)
- 4 growth stages (C2/D2/E)
- 8 investment plan options (E7)
- 7 crop types (signup)
- 5 spray product types (E3)

### Dynamic (fetched from database at runtime)

| Data | Source Table | When Fetched |
|------|-------------|--------------|
| Farmer lookup result | `user_accounts` | On phone search |
| Province list | `address_th_province` | On component mount |
| District list | `address_th_district` | On province selection |
| Subdistrict list | `address_th_subdistrict` | On district selection |

### Dynamic (bound via WeWeb editor)

| Data | Source |
|------|--------|
| Interviewer access token | WeWeb auth variable |
| Interviewer user ID | WeWeb auth variable |
| Supabase URL and anon key | WeWeb editor properties |

## Survey Data Storage

### Simple Fields → `text_value`

Fields A1-A5, A7-A9, E6, E6.1-E6.4, E7 are stored as `text_value` (stringified number or select value) in `form_responses`.

### Complex Fields → `object_value`

Fields A6, B, C, D, E1-E5 are stored as `object_value` (JSON) in `form_responses`.

**A6 — Rice Varieties:**
```json
[
  { "variety": "กข61", "harvest_days": 120 },
  { "variety": "ปทุมธานี 1", "harvest_days": 110 }
]
```

**B/C/D — Assessment Matrices (all items stored, found + not found):**
```json
{
  "items": [
    { "code": "weed_01", "found": true, "damage": 4, "control_difficulty": 3 },
    { "code": "weed_02", "found": false, "damage": null, "control_difficulty": null },
    { "code": "pest_01", "found": true, "stages": [1, 2], "damage": 5, "control_difficulty": 4 }
  ]
}
```

All items from the option list are included (even unchecked ones with `found: false`). This ensures explicit "not found" data for downstream analysis, as opposed to ambiguous missing data.

Insect (C) and disease (D) matrices also include a `stages` array with growth stage values (1-4) indicating when the pest/disease was observed.

**E1-E5 — Spray Applications:**
```json
{
  "stages": {
    "small_stage": {
      "total_sprays": 2,
      "applications": [
        { "product": "Brand X", "type": "herbicide", "amount": "100 ml/rai", "water_liters": 60 },
        { "product": "Brand Y", "type": "insecticide", "amount": "50 g/rai", "water_liters": 80 }
      ]
    },
    "tillering_stage": { "total_sprays": 0, "applications": [] },
    "booting_stage": { "total_sprays": 0, "applications": [] },
    "maturity_stage": { "total_sprays": 0, "applications": [] }
  }
}
```

## File Structure

```
src/
├── constants.js                  # All hardcoded IDs, option lists, helpers
├── wwElement.vue                 # Main component (phases, wizard, submit logic)
└── components/
    ├── AssessmentMatrix.vue      # Reusable for sections B, C, D
    ├── RatingScale.vue           # 1-5 radio circle scale
    ├── SprayStagePanel.vue       # Per-growth-stage spray entry (section E)
    └── VarietyRepeater.vue       # A6 rice variety table (add/remove rows)
ww-config.js                      # WeWeb editor configuration
package.json                      # Dependencies: polaris-weweb-styles, @supabase/supabase-js
```

## Validation Rules

| Phase/Step | Rule |
|------------|------|
| Phase 1 | Phone must be 9-10 digits after stripping formatting |
| Phase 2 | All fields required: firstname, lastname, province, district, subdistrict, at least 1 crop, area > 0 |
| Step 1 (A) | A1: 15-99, A2: >= 1, A3: selected, A4: >= 1, A5: 1-4, A6: >= 1 row with variety filled, A7/A8/A9: >= 0 |
| Steps 2-4 (B/C/D) | If an item is checked, its damage and control_difficulty ratings are required. If stages apply, at least one stage must be selected. |
| Step 5 (E) | E7 investment plan is required. E6 percentages warn (but don't block) if they don't sum to 100. |
| Step 6 | Review only. Submit triggers the full write flow. |

## Notifications

Toast notifications appear in the top-right corner (fixed position, 360px wide). All auto-dismiss:
- Success/info: 3 seconds
- Warning: 4 seconds
- Error: 8 seconds

## Debug Panel

A collapsible panel at the bottom of the component (hidden by default, toggled by a "Debug" button). Logs all significant actions with timestamps: mount, tel lookup, user found/not found, submission steps, errors.

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `polaris-weweb-styles` | ^2.1.0 | Polaris Vue components + SCSS tokens |
| `@supabase/supabase-js` | ^2.49.1 | Supabase client for all DB operations |
| `@weweb/cli` | latest | Build toolchain (dev only) |
