<template>
  <div class="spray-panel">
    <PolarisCard>
      <PolarisCardHeader :title="stageLabel" />
      <PolarisCardSection>
        <PolarisBlockStack gap="400">
          <PolarisTextField
            label="E1. จำนวนครั้งที่ฉีดพ่นในระยะนี้"
            type="number"
            :modelValue="stageData.total_sprays"
            @update:modelValue="updateTotalSprays(Number($event) || 0)"
            :min="0"
            :max="20"
            suffix="ครั้ง"
          />

          <template v-if="stageData.total_sprays > 0">
            <div
              v-for="(session, sIdx) in sessions"
              :key="sIdx"
              class="spray-panel__session"
            >
              <PolarisText variant="headingSm">ครั้งที่ {{ sIdx + 1 }}</PolarisText>

              <div
                v-for="(prod, pIdx) in session.products"
                :key="pIdx"
                class="spray-panel__product"
              >
                <div class="spray-panel__product-header">
                  <PolarisText variant="bodySm" fontWeight="semibold">ยาที่ {{ pIdx + 1 }}</PolarisText>
                  <PolarisButton
                    v-if="session.products.length > 1"
                    variant="plain"
                    tone="critical"
                    size="slim"
                    @click="removeProduct(sIdx, pIdx)"
                  >ลบ</PolarisButton>
                </div>

                <div class="spray-panel__fields">
                  <PolarisSelect
                    label="E2. ชนิดของยา"
                    :options="sprayTypeOptions"
                    :modelValue="prod.pesticide_type"
                    @update:modelValue="onTypeChange(sIdx, pIdx, $event)"
                    placeholder="เลือกชนิดยา"
                    :error="fieldError(sIdx, pIdx, 'pesticide_type')"
                  />

                  <template v-if="prod.pesticide_type">
                    <PolarisSelect
                      label="E2.1 แบรนด์ของยา"
                      :options="getBrandOptions(prod.pesticide_type)"
                      :modelValue="prod.brand"
                      @update:modelValue="updateProduct(sIdx, pIdx, 'brand', $event)"
                      placeholder="เลือกแบรนด์"
                      :error="fieldError(sIdx, pIdx, 'brand')"
                    />
                    <PolarisTextField
                      v-if="prod.brand === 'other'"
                      label="ระบุชื่อยา"
                      :modelValue="prod.brand_other"
                      @update:modelValue="updateProduct(sIdx, pIdx, 'brand_other', $event)"
                      placeholder="พิมพ์ชื่อยา"
                      :error="fieldError(sIdx, pIdx, 'brand_other')"
                    />
                  </template>
                </div>

                <div v-if="prod.pesticide_type === 'hormone'" class="spray-panel__multi">
                  <MultiSelectDropdown
                    label="วัตถุประสงค์ในการใส่"
                    help-text="เลือกได้มากกว่า 1 รายการ — คลิกเพื่อเปิดรายการ แล้วเลือกหลายรายการ"
                    placeholder="เลือกวัตถุประสงค์..."
                    :options="hormonePurposeOptions"
                    :model-value="prod.hormone_purpose || []"
                    :error="fieldError(sIdx, pIdx, 'hormone_purpose')"
                    @update:modelValue="setHormonePurposes(sIdx, pIdx, $event)"
                  />
                  <PolarisTextField
                    v-if="(prod.hormone_purpose || []).includes('other')"
                    label="ระบุวัตถุประสงค์"
                    :modelValue="prod.hormone_purpose_other"
                    @update:modelValue="updateProduct(sIdx, pIdx, 'hormone_purpose_other', $event)"
                    placeholder="พิมพ์รายละเอียด"
                    :error="fieldError(sIdx, pIdx, 'hormone_purpose_other')"
                  />
                </div>

                <div v-if="prod.pesticide_type && prod.pesticide_type !== 'hormone'" class="spray-panel__pest-block">
                  <div class="spray-panel__fields">
                    <PolarisSelect
                      label="E3.1 ศัตรูพืชเป้าหมาย (หลัก)"
                      :options="getPestOptions(prod.pesticide_type)"
                      :modelValue="prod.pest_primary"
                      @update:modelValue="updateProduct(sIdx, pIdx, 'pest_primary', $event)"
                      placeholder="เลือกศัตรูพืชหลัก"
                    />
                  </div>
                  <div class="spray-panel__multi">
                    <MultiSelectDropdown
                      label="E3.2 ศัตรูพืชเป้าหมาย (รอง)"
                      help-text="เลือกได้มากกว่า 1 รายการ (ถ้ามี) — คลิกเพื่อเปิดรายการ"
                      placeholder="เลือกศัตรูพืชรอง..."
                      :options="getPestOptions(prod.pesticide_type)"
                      :model-value="prod.pest_secondary || []"
                      @update:modelValue="updateProduct(sIdx, pIdx, 'pest_secondary', $event)"
                    />
                  </div>
                </div>

                <div class="spray-panel__fields">
                  <PolarisTextField
                    label="E3.3 ขนาดบรรจุภัณฑ์ที่ซื้อ (กรัม/ซีซี)"
                    :modelValue="prod.package_size"
                    @update:modelValue="updateProduct(sIdx, pIdx, 'package_size', $event)"
                    placeholder="เช่น 100 ซีซี"
                  />
                  <PolarisTextField
                    label="E3.4 ซื้อยามาด้วยราคาเท่าไหร่ (บาท)"
                    :modelValue="prod.purchase_price"
                    @update:modelValue="updateProduct(sIdx, pIdx, 'purchase_price', $event)"
                    placeholder="ระบุราคา"
                    :error="fieldError(sIdx, pIdx, 'purchase_price')"
                  />
                  <PolarisTextField
                    label="E4. ปริมาณที่ใช้ (กรัม/ซีซี ต่อไร่)"
                    :modelValue="prod.amount"
                    @update:modelValue="updateProduct(sIdx, pIdx, 'amount', $event)"
                    placeholder="ระบุปริมาณ"
                    :error="fieldError(sIdx, pIdx, 'amount')"
                  />
                </div>

                <div class="spray-panel__satisfaction">
                  <PolarisText variant="bodySm" fontWeight="semibold">E5. ความพึงพอใจต่อยานี้</PolarisText>
                  <RatingScale
                    :modelValue="prod.satisfaction"
                    :name="`sat-${stageKey}-${sIdx}-${pIdx}`"
                    lowLabel="1=ไม่พอใจ"
                    highLabel="5=พอใจมาก"
                    :reversed="true"
                    @update:modelValue="updateProduct(sIdx, pIdx, 'satisfaction', $event)"
                  />
                </div>
              </div>

              <PolarisButton
                size="slim"
                @click="addProduct(sIdx)"
              >+ เพิ่มยา</PolarisButton>
            </div>
          </template>
        </PolarisBlockStack>
      </PolarisCardSection>
    </PolarisCard>
  </div>
</template>

<script>
import {
  PolarisCard, PolarisCardHeader, PolarisCardSection,
  PolarisTextField, PolarisSelect, PolarisBlockStack, PolarisText, PolarisButton,
} from 'polaris-weweb-styles/components'
import {
  createEmptyProduct, normalizeSprayProduct, SPRAY_TYPE_OPTIONS,
  BRAND_OPTIONS_MAP, PEST_TARGET_OPTIONS_MAP, HORMONE_PURPOSE_OPTIONS,
} from '../constants.js'
import RatingScale from './RatingScale.vue'
import MultiSelectDropdown from './MultiSelectDropdown.vue'

export default {
  components: {
    PolarisCard, PolarisCardHeader, PolarisCardSection,
    PolarisTextField, PolarisSelect, PolarisBlockStack, PolarisText, PolarisButton,
    RatingScale,
    MultiSelectDropdown,
  },
  props: {
    stageKey: { type: String, required: true },
    stageLabel: { type: String, required: true },
    modelValue: { type: Object, default: () => ({ total_sprays: 0, sessions: [] }) },
    errors: { type: Object, default: () => ({}) },
  },
  emits: ['update:modelValue'],
  computed: {
    stageData() {
      return this.modelValue || { total_sprays: 0, sessions: [] }
    },
    sessions() {
      const count = this.stageData.total_sprays || 0
      const existing = this.stageData.sessions || []
      const result = []
      for (let i = 0; i < count; i++) {
        const s = existing[i]
        if (s && s.products?.length) {
          result.push({
            products: s.products.map(p => normalizeSprayProduct({ ...p })),
          })
        } else {
          result.push({ products: [createEmptyProduct()] })
        }
      }
      return result
    },
    sprayTypeOptions() {
      return SPRAY_TYPE_OPTIONS
    },
    hormonePurposeOptions() {
      return HORMONE_PURPOSE_OPTIONS
    },
  },
  methods: {
    getBrandOptions(type) {
      return BRAND_OPTIONS_MAP[type] || []
    },
    getPestOptions(type) {
      return PEST_TARGET_OPTIONS_MAP[type] || []
    },
    fieldError(sIdx, pIdx, field) {
      const key = `spray_${this.stageKey}_${sIdx}_${pIdx}_${field}`
      return this.errors[key] ? 'กรุณากรอกข้อมูลนี้' : undefined
    },
    emitUpdate(sessions, totalSprays) {
      this.$emit('update:modelValue', {
        total_sprays: totalSprays ?? this.stageData.total_sprays,
        sessions,
      })
    },
    updateTotalSprays(count) {
      const clamped = Math.max(0, Math.min(20, count))
      const existing = this.sessions
      const sessions = []
      for (let i = 0; i < clamped; i++) {
        sessions.push(existing[i] || { products: [createEmptyProduct()] })
      }
      this.emitUpdate(sessions, clamped)
    },
    onTypeChange(sIdx, pIdx, newType) {
      const sessions = this.sessions.map((s, si) => {
        if (si !== sIdx) return { products: s.products.map(p => ({ ...p })) }
        return {
          products: s.products.map((p, pi) => {
            if (pi !== pIdx) return { ...p }
            const amt = p.amount
            const price = p.purchase_price
            const pkg = p.package_size
            return {
              ...createEmptyProduct(),
              pesticide_type: newType,
              amount: amt != null && amt !== '' ? String(amt) : '',
              purchase_price: price != null && price !== '' ? String(price) : '',
              package_size: pkg != null && pkg !== '' ? String(pkg) : '',
              satisfaction: p.satisfaction,
            }
          }),
        }
      })
      this.emitUpdate(sessions)
    },
    setHormonePurposes(sIdx, pIdx, arr) {
      const next = Array.isArray(arr) ? arr : []
      const sessions = this.sessions.map((s, si) => {
        if (si !== sIdx) return { products: s.products.map(p => ({ ...p })) }
        return {
          products: s.products.map((p, pi) => {
            if (pi !== pIdx) return { ...p }
            let other = p.hormone_purpose_other
            if (!next.includes('other')) other = ''
            return { ...p, hormone_purpose: next, hormone_purpose_other: other }
          }),
        }
      })
      this.emitUpdate(sessions)
    },
    updateProduct(sIdx, pIdx, field, value) {
      const sessions = this.sessions.map((s, si) => {
        if (si !== sIdx) return { products: s.products.map(p => ({ ...p })) }
        return {
          products: s.products.map((p, pi) =>
            pi === pIdx ? { ...p, [field]: value } : { ...p }
          ),
        }
      })
      this.emitUpdate(sessions)
    },
    addProduct(sIdx) {
      const sessions = this.sessions.map((s, si) => {
        if (si !== sIdx) return { products: s.products.map(p => ({ ...p })) }
        return { products: [...s.products.map(p => ({ ...p })), createEmptyProduct()] }
      })
      this.emitUpdate(sessions)
    },
    removeProduct(sIdx, pIdx) {
      const sessions = this.sessions.map((s, si) => {
        if (si !== sIdx) return { products: s.products.map(p => ({ ...p })) }
        return { products: s.products.filter((_, pi) => pi !== pIdx).map(p => ({ ...p })) }
      })
      this.emitUpdate(sessions)
    },
  },
}
</script>

<style lang="scss" scoped>
@import 'polaris-weweb-styles';

.spray-panel {
  &__session {
    display: flex;
    flex-direction: column;
    gap: var(--p-space-300);
    padding: var(--p-space-400);
    border: var(--p-border-width-025) solid var(--p-color-border);
    border-radius: var(--p-border-radius-200);
    background: var(--p-color-bg-surface-secondary);
  }

  &__product {
    display: flex;
    flex-direction: column;
    gap: var(--p-space-200);
    padding: var(--p-space-300);
    border: var(--p-border-width-025) solid var(--p-color-border);
    border-radius: var(--p-border-radius-100);
    background: var(--p-color-bg-surface);
  }

  &__product-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__fields {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--p-space-300);

    @media (min-width: 768px) {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }
  }

  &__fields--full {
    @media (min-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &__pest-block {
    display: flex;
    flex-direction: column;
    gap: var(--p-space-300);
    grid-column: 1 / -1;
  }

  &__multi {
    display: flex;
    flex-direction: column;
    gap: var(--p-space-150);
    grid-column: 1 / -1;
  }

  &__satisfaction {
    display: flex;
    flex-direction: column;
    gap: var(--p-space-150);
  }
}
</style>
