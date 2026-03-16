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
                  <PolarisTextField
                    label="E2. ชื่อผลิตภัณฑ์/ยี่ห้อ"
                    :modelValue="prod.product"
                    @update:modelValue="updateProduct(sIdx, pIdx, 'product', $event)"
                    placeholder="ระบุชื่อยา"
                    :error="fieldError(sIdx, pIdx, 'product')"
                  />
                  <PolarisTextField
                    label="E3. ศัตรูพืชเป้าหมาย"
                    :modelValue="prod.pest_target"
                    @update:modelValue="updateProduct(sIdx, pIdx, 'pest_target', $event)"
                    placeholder="ระบุศัตรูพืช"
                  />
                  <PolarisTextField
                    label="E4. ปริมาณที่ใช้"
                    type="number"
                    :min="0"
                    suffix="มล./ไร่"
                    :modelValue="prod.amount"
                    @update:modelValue="updateProduct(sIdx, pIdx, 'amount', $event ? Number($event) : null)"
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
  PolarisTextField, PolarisBlockStack, PolarisText, PolarisButton,
} from 'polaris-weweb-styles/components'
import { createEmptyProduct } from '../constants.js'
import RatingScale from './RatingScale.vue'

export default {
  components: {
    PolarisCard, PolarisCardHeader, PolarisCardSection,
    PolarisTextField, PolarisBlockStack, PolarisText, PolarisButton,
    RatingScale,
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
          result.push({ products: [...s.products] })
        } else {
          result.push({ products: [createEmptyProduct()] })
        }
      }
      return result
    },
  },
  methods: {
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
      grid-template-columns: 1fr 1fr 1fr;
    }
  }

  &__satisfaction {
    display: flex;
    flex-direction: column;
    gap: var(--p-space-150);
  }
}
</style>
