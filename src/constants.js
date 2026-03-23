export const FORM_ID = '622bed39-c4df-4d5d-9c4b-2ac4873104fa'
export const FORM_CODE = 'RICE_BIGGROWER_2026'
export const MERCHANT_ID = '8f67aa08-dfce-454d-bfb1-effc4ee45f1f'
export const USER_PROFILE_FORM_ID = 'a0000000-0000-0000-0000-000000000001'
export const CROP_FIELD_ID = 'c0000000-0000-0000-0000-000000000001'
export const AREA_FIELD_ID = 'c0000000-0000-0000-0000-000000000002'

export const FIELDS = {
  a1_age:              { id: '83b257a7-5398-4ab0-af0a-5ff729d8eaaa', type: 'number', required: true, min: 15, max: 99 },
  a2_rice_area_rai:    { id: '30999277-192e-41d8-8ab9-a9f0a6863f05', type: 'number', required: true, min: 1 },
  a3_harvest_month:    { id: '7255950e-19d0-41fb-b009-09e842ccd3ae', type: 'single_select', required: true },
  a4_farming_years:    { id: 'e6feaad3-5e94-4c90-833d-12896f7a4c9f', type: 'number', required: true, min: 1 },
  a5_seasons_per_year: { id: '34311768-e671-4236-8b5d-8647ed50b36f', type: 'number', required: true, min: 1, max: 4 },
  a6_rice_varieties:   { id: '428b2d8c-8041-4251-ada5-f68ff1597d55', type: 'object', required: true },
  a7_yield_per_rai:    { id: '1e963188-8f41-45c7-a355-5ab8be9e1c08', type: 'number', required: true, min: 0 },
  a8_selling_price:    { id: '1830157d-786c-45fe-a3a4-e7521ae1d1db', type: 'number', required: true, min: 0 },
  a9_breakeven_price:  { id: 'dde52e35-8406-4a39-acc3-c40cbbb0f6c5', type: 'number', required: true, min: 0 },
  b_weed_assessment:   { id: '1e0aedb8-074d-4fe8-8dd5-bd4edc4c8a4d', type: 'object', required: false },
  c_insect_assessment: { id: '29c2c930-fe42-423d-9789-ded2574b7605', type: 'object', required: false },
  d_disease_assessment:{ id: '2b6f0034-13c5-4ea9-933c-eae20f7018f2', type: 'object', required: false },
  e1_e5_spray_applications: { id: 'c679d268-48f7-441b-a295-b3fb15baf642', type: 'object', required: false },
  e6_total_cost:       { id: 'a4eaca64-d961-4835-91ac-27ba68c50f97', type: 'number', required: false, min: 0 },
  e6_1_herbicide_pct:  { id: 'ceaef267-3ea7-4084-bdc2-55907d7ab626', type: 'number', required: false, min: 0, max: 100 },
  e6_2_insecticide_pct:{ id: 'e0c1e3d6-74ab-43fa-b629-4d55a5f0c362', type: 'number', required: false, min: 0, max: 100 },
  e6_3_fungicide_pct:  { id: '9d13b1de-3c8e-4668-a031-5e0251d1a9fe', type: 'number', required: false, min: 0, max: 100 },
  e6_4_hormone_pct:    { id: '1c735204-25c1-477a-afa9-31b21fe1fcfb', type: 'number', required: false, min: 0, max: 100 },
  e7_investment_plan:  { id: 'a86fc9ec-0d11-4281-b58b-980da42488d7', type: 'single_select', required: true },
}

export const MONTH_OPTIONS = [
  { value: '1', label: 'มกราคม' },
  { value: '2', label: 'กุมภาพันธ์' },
  { value: '3', label: 'มีนาคม' },
  { value: '4', label: 'เมษายน' },
  { value: '5', label: 'พฤษภาคม' },
  { value: '6', label: 'มิถุนายน' },
  { value: '7', label: 'กรกฎาคม' },
  { value: '8', label: 'สิงหาคม' },
  { value: '9', label: 'กันยายน' },
  { value: '10', label: 'ตุลาคม' },
  { value: '11', label: 'พฤศจิกายน' },
  { value: '12', label: 'ธันวาคม' },
]

export const WEED_OPTIONS = [
  { code: 'weed_g01', label: 'หญ้าข้าวนก, หญ้าพุ่มพวง, หญ้าคอมมิวนิสต์' },
  { code: 'weed_g02', label: 'หญ้าข้าวนกสีชมพ, หญ้าข้าวปล้อง, หญ้านก' },
  { code: 'weed_g03', label: 'หญ้าแดง, หญ้ากระดูกไก่, หญ้าก้านธูป, หญ้าสล้าง' },
  { code: 'weed_g04', label: 'หญ้าดอกขาว, หญ้าลิเก, หญ้าไม้กวาด' },
  { code: 'weed_g05', label: 'ผักปอดนา, หญ้าจำปา, ผักพริก, ผักปุ่มปลา' },
  { code: 'weed_g06', label: 'หนวดปลาดุก, หญ้าหนวดแมว, หญ้าไข่กบ, หญ้าไข่เขียด' },
  { code: 'weed_g07', label: 'กกขนาก, หญ้าดอกต่อ, ผือน้อย' },
  { code: 'weed_g08', label: 'กกทราย, กกแดง, หญ้ารังกา' },
  { code: 'weed_g09', label: 'เซ่งใบมน' },
  { code: 'weed_g10', label: 'เทียนนา' },
  { code: 'weed_g11', label: 'โสนคางคก' },
  { code: 'weed_g12', label: 'หญ้าชะกาดน้ำเค็ม' },
  { code: 'weed_g13', label: 'หญ้าชันกาศ' },
  { code: 'weed_g14', label: 'หญ้ากุศลา' },
  { code: 'weed_g15', label: 'ปอวัชพืช' },
  { code: 'weed_g16', label: 'สะอึก' },
  { code: 'weed_g17', label: 'โสนหางไก่' },
  { code: 'weed_g18', label: 'ข้าวดีด' },
  { code: 'weed_other_1', label: 'อื่นๆ (ระบุ) 1', hasCustomInput: true },
  { code: 'weed_other_2', label: 'อื่นๆ (ระบุ) 2', hasCustomInput: true },
]

export const INSECT_OPTIONS = [
  { code: 'pest_01', label: 'บั่ว' },
  { code: 'pest_02', label: 'เพลี้ยกระโดดสีน้ำตาล' },
  { code: 'pest_03', label: 'เพลี้ยไฟ' },
  { code: 'pest_04', label: 'แมลงสิง' },
  { code: 'pest_05', label: 'หนอนกอข้าว' },
  { code: 'pest_06', label: 'หนอนห่อใบข้าว' },
  { code: 'pest_07', label: 'แมลงดำหนาม' },
  { code: 'pest_other_1', label: 'อื่นๆ (ระบุ) 1', hasCustomInput: true },
  { code: 'pest_other_2', label: 'อื่นๆ (ระบุ) 2', hasCustomInput: true },
]

export const DISEASE_OPTIONS = [
  { code: 'disease_01', label: 'โรคกาบใบเน่า' },
  { code: 'disease_02', label: 'โรคกาบใบแห้ง' },
  { code: 'disease_03', label: 'โรคขอบใบแห้ง' },
  { code: 'disease_04', label: 'โรคดอกกระถิน' },
  { code: 'disease_05', label: 'โรคใบขีดสีน้ำตาล' },
  { code: 'disease_06', label: 'โรคใบจุดสีน้ำตาล' },
  { code: 'disease_07', label: 'โรคเมล็ดด่าง' },
  { code: 'disease_08', label: 'โรคไหม้' },
  { code: 'disease_other_1', label: 'อื่นๆ (ระบุ) 1', hasCustomInput: true },
  { code: 'disease_other_2', label: 'อื่นๆ (ระบุ) 2', hasCustomInput: true },
]

export const GROWTH_STAGES = [
  { value: 1, label: 'ระยะข้าวเล็ก', key: 'small_stage' },
  { value: 2, label: 'ระยะแตกกอ', key: 'tillering_stage' },
  { value: 3, label: 'ระยะข้าวท้อง', key: 'booting_stage' },
  { value: 4, label: 'ระยะสุกแก่/เก็บเกี่ยว', key: 'maturity_stage' },
]

export const INVESTMENT_OPTIONS = [
  { value: '1', label: 'ลงทุนเพิ่มขึ้น' },
  { value: '2', label: 'ลงทุนเท่าเดิม' },
  { value: '3', label: 'ลงทุนลดลงไม่เกิน 10%' },
  { value: '4', label: 'ลงทุนลดลง 11% - 20%' },
  { value: '5', label: 'ลงทุนลดลง 21% - 30%' },
  { value: '6', label: 'ลงทุนลดลง 31% - 40%' },
  { value: '7', label: 'ลงทุนลดลง 41% - 50%' },
  { value: '8', label: 'ลงทุนลดลงมากกว่า 50%' },
]

export const CROP_OPTIONS = [
  { value: 'rice', label: 'ข้าว' },
  { value: 'field_corn', label: 'ข้าวโพดไร่' },
  { value: 'sweet_corn', label: 'ข้าวโพดหวาน' },
  { value: 'fruit', label: 'ผลไม้' },
  { value: 'leafy_vegetables', label: 'ผักกินใบ' },
  { value: 'fruit_root_vegetables', label: 'ผักให้ผล/หัว' },
  { value: 'other_field_crops', label: 'พืชไร่อื่นๆ' },
]

export const RICE_VARIETY_OPTIONS = [
  { value: 'กข 41', label: 'กข 41' },
  { value: 'กข 85', label: 'กข 85' },
  { value: 'กข 61', label: 'กข 61' },
  { value: '5451', label: '5451 (ข้าวเวียดนาม)' },
  { value: 'ขาวดอกมะลิ 105', label: 'ขาวดอกมะลิ 105' },
  { value: 'พิษณุโลก 2', label: 'พิษณุโลก 2' },
  { value: 'กข 49', label: 'กข 49' },
  { value: 'กข 79', label: 'กข 79' },
  { value: 'กข 95', label: 'กข 95' },
  { value: 'กข 5', label: 'กข 5' },
  { value: 'จัสมิน 20', label: 'จัสมิน 20' },
  { value: 'กข 57', label: 'กข 57' },
  { value: 'กข 47', label: 'กข 47' },
  { value: 'other', label: 'อื่นๆ โปรดระบุ' },
]

export const SPRAY_TYPE_OPTIONS = [
  { value: 'herbicide', label: 'ยาหญ้า' },
  { value: 'insecticide', label: 'ยาแมลง' },
  { value: 'fungicide', label: 'ยาเชื้อรา' },
  { value: 'hormone', label: 'ฮอร์โมนส์' },
]

export const HERBICIDE_BRAND_OPTIONS = [
  { value: 'โซฟิต', label: 'โซฟิต' },
  { value: 'นาการ์ด', label: 'นาการ์ด' },
  { value: 'เอคโค่', label: 'เอคโค่' },
  { value: 'พอราโด้', label: 'พอราโด้' },
  { value: 'โซลิโต้', label: 'โซลิโต้' },
  { value: 'อัลมิกซ์', label: 'อัลมิกซ์' },
  { value: 'ไพแองเคอร์', label: 'ไพแองเคอร์' },
  { value: 'เตตริส', label: 'เตตริส' },
  { value: 'นอร์มินี', label: 'นอร์มินี' },
  { value: 'แกมิต', label: 'แกมิต' },
  { value: 'ดาราเอมีน', label: 'ดาราเอมีน' },
  { value: 'ไรเซอร์', label: 'ไรเซอร์' },
  { value: 'ไพซีโร่', label: 'ไพซีโร่' },
  { value: 'บิวทาคลอร์ (generics)', label: 'บิวทาคลอร์ (generics)' },
  { value: 'เพรทิลาคลอร์ (generics)', label: 'เพรทิลาคลอร์ (generics)' },
  { value: 'ไพริเบนซอกซิม (generics)', label: 'ไพริเบนซอกซิม (generics)' },
  { value: 'บิสไพริแบค-โซเดียม (generics)', label: 'บิสไพริแบค-โซเดียม (generics)' },
  { value: 'โพรฟอกซิดิม (generics)', label: 'โพรฟอกซิดิม (generics)' },
  { value: 'โคลมาโซน + โพรพานิล (generics)', label: 'โคลมาโซน + โพรพานิล (generics)' },
  { value: 'บิวทาคลอร์ + โพรพานิล (generics)', label: 'บิวทาคลอร์ + โพรพานิล (generics)' },
  { value: 'ทูโฟดี (generics)', label: 'ทูโฟดี (generics)' },
  { value: 'ไซฮาโลฟอป-บิวทิล (generics)', label: 'ไซฮาโลฟอป-บิวทิล (generics)' },
  { value: 'other', label: 'อื่นๆ ระบุ' },
]

export const INSECTICIDE_BRAND_OPTIONS = [
  { value: 'แอคทารา', label: 'แอคทารา' },
  { value: 'แอมเมท', label: 'แอมเมท' },
  { value: 'แอสเซนต์', label: 'แอสเซนต์' },
  { value: 'เบลท์ เอ็กซ์เพิร์ท', label: 'เบลท์ เอ็กซ์เพิร์ท' },
  { value: 'พรีวาธอน', label: 'พรีวาธอน' },
  { value: 'โปรวาโด', label: 'โปรวาโด' },
  { value: 'ริดดิด', label: 'ริดดิด' },
  { value: 'เวอตาโก', label: 'เวอตาโก' },
  { value: 'เพลนั่ม', label: 'เพลนั่ม' },
  { value: 'เคอร์บิกซ์', label: 'เคอร์บิกซ์' },
  { value: 'สตาร์เกิล', label: 'สตาร์เกิล' },
  { value: 'วาเยโก', label: 'วาเยโก' },
  { value: 'อะบาเมคติน (generics)', label: 'อะบาเมคติน (generics)' },
  { value: 'คาร์โบซัลแฟน (generics)', label: 'คาร์โบซัลแฟน (generics)' },
  { value: 'คาร์แทปไฮโดรคลอไรด์ (generics)', label: 'คาร์แทปไฮโดรคลอไรด์ (generics)' },
  { value: 'ไซเพอร์เมทริน (generics)', label: 'ไซเพอร์เมทริน (generics)' },
  { value: 'อีมาเมกตินเบนโซเอต (generics)', label: 'อีมาเมกตินเบนโซเอต (generics)' },
  { value: 'ฟิโพรนิล (generics)', label: 'ฟิโพรนิล (generics)' },
  { value: 'ลูเฟนนูรอน (generics)', label: 'ลูเฟนนูรอน (generics)' },
  { value: 'ไบเฟนทริน (generics)', label: 'ไบเฟนทริน (generics)' },
  { value: 'ไตรอะโซฟอส (generics)', label: 'ไตรอะโซฟอส (generics)' },
  { value: 'ไพมีโทรซีน (generics)', label: 'ไพมีโทรซีน (generics)' },
  { value: 'other', label: 'อื่นๆ ระบุ' },
]

export const FUNGICIDE_BRAND_OPTIONS = [
  { value: 'อามูเร่', label: 'อามูเร่' },
  { value: 'เซลติมา', label: 'เซลติมา' },
  { value: 'นาติโว', label: 'นาติโว' },
  { value: 'ออติวา', label: 'ออติวา' },
  { value: 'เอเทียจ', label: 'เอเทียจ' },
  { value: 'รีเฟลกซ์ อีโว่', label: 'รีเฟลกซ์ อีโว่' },
  { value: 'อาคาเพลลา ซิสเท็ม', label: 'อาคาเพลลา ซิสเท็ม' },
  { value: 'แอนทราโคล', label: 'แอนทราโคล' },
  { value: 'แอนวิล', label: 'แอนวิล' },
  { value: 'บีม', label: 'บีม' },
  { value: 'คัสโตเดีย', label: 'คัสโตเดีย' },
  { value: 'ฟูจิวัน', label: 'ฟูจิวัน' },
  { value: 'คาซู', label: 'คาซู' },
  { value: 'ลูน่าเอกซ์พีเรียน', label: 'ลูน่าเอกซ์พีเรียน' },
  { value: 'ไทแบค', label: 'ไทแบค' },
  { value: 'ไดฟีโนโคนาโซล + โพรพิโคนาโซล (generics)', label: 'ไดฟีโนโคนาโซล + โพรพิโคนาโซล (generics)' },
  { value: 'อะซ็อกซีสโตรบิน + ไดฟีโนโคนาโซล (generics)', label: 'อะซ็อกซีสโตรบิน + ไดฟีโนโคนาโซล (generics)' },
  { value: 'คาเบนดาซิม (generics)', label: 'คาเบนดาซิม (generics)' },
  { value: 'แมนโคเซบ (generics)', label: 'แมนโคเซบ (generics)' },
  { value: 'โพรพิเนบ (generics)', label: 'โพรพิเนบ (generics)' },
  { value: 'วาลิดามัยซิน (generics)', label: 'วาลิดามัยซิน (generics)' },
  { value: 'เฮกซะโคนาโซล (generics)', label: 'เฮกซะโคนาโซล (generics)' },
  { value: 'other', label: 'อื่นๆ ระบุ' },
]

export const BRAND_OPTIONS_MAP = {
  herbicide: HERBICIDE_BRAND_OPTIONS,
  insecticide: INSECTICIDE_BRAND_OPTIONS,
  fungicide: FUNGICIDE_BRAND_OPTIONS,
}

export const PEST_TARGET_OPTIONS_MAP = {
  herbicide: WEED_OPTIONS.map(w => ({ value: w.code, label: w.label })),
  insecticide: INSECT_OPTIONS.map(i => ({ value: i.code, label: i.label })),
  fungicide: DISEASE_OPTIONS.map(d => ({ value: d.code, label: d.label })),
}

export function createEmptyProduct() {
  return {
    pesticide_type: null,
    brand: null,
    brand_other: '',
    pest_primary: null,
    pest_secondary: null,
    package_size: '',
    purchase_price: null,
    amount: null,
    satisfaction: null,
  }
}

export const SURVEY_STEPS = [
  { id: 1, key: 'section_a', title: 'A) ข้อมูลทั่วไปเกี่ยวกับการปลูกข้าว' },
  { id: 2, key: 'section_b', title: 'B) คำถามเกี่ยวกับการจัดการวัชพืช' },
  { id: 3, key: 'section_c', title: 'C) คำถามเกี่ยวกับแมลง/หนอน' },
  { id: 4, key: 'section_d', title: 'D) คำถามเกี่ยวกับโรค' },
  { id: 5, key: 'section_e', title: 'E) คำถามเกี่ยวกับการใช้สารอารักขาพืช' },
  { id: 6, key: 'review', title: 'ตรวจสอบและส่ง' },
]

export const DAMAGE_LABELS = { low: '1=แทบไม่เสียหาย', high: '5=เสียหายมาก' }
export const CONTROL_LABELS = { low: '1=ง่ายมาก', high: '5=ยากมาก' }

export function normalizeTel(tel) {
  let cleaned = (tel || '').replace(/[\s\-]/g, '')
  if (cleaned.startsWith('0')) cleaned = '+66' + cleaned.substring(1)
  else if (cleaned.startsWith('66') && !cleaned.startsWith('+66')) cleaned = '+' + cleaned
  else if (!cleaned.startsWith('+')) cleaned = '+66' + cleaned
  return cleaned
}

export function initWeedAssessment() {
  return {
    items: WEED_OPTIONS.map(w => ({
      code: w.code,
      found: false,
      custom_name: w.hasCustomInput ? '' : undefined,
      damage: null,
      control_difficulty: null,
    })),
  }
}

export function initInsectAssessment() {
  return {
    items: INSECT_OPTIONS.map(i => ({
      code: i.code,
      found: false,
      custom_name: i.hasCustomInput ? '' : undefined,
      stages: [],
      damage: null,
      control_difficulty: null,
    })),
  }
}

export function initDiseaseAssessment() {
  return {
    items: DISEASE_OPTIONS.map(d => ({
      code: d.code,
      found: false,
      custom_name: d.hasCustomInput ? '' : undefined,
      stages: [],
      damage: null,
      control_difficulty: null,
    })),
  }
}

export function initSprayApplications() {
  return {
    stages: {
      small_stage:     { total_sprays: 0, sessions: [] },
      tillering_stage: { total_sprays: 0, sessions: [] },
      booting_stage:   { total_sprays: 0, sessions: [] },
      maturity_stage:  { total_sprays: 0, sessions: [] },
    },
  }
}
