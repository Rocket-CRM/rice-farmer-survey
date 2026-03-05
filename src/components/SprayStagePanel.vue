<template>
  <div class="spray-panel">
    <PolarisCard>
      <PolarisCardHeader :title="stageLabel" />
      <PolarisCardSection>
        <PolarisBlockStack gap="400">
          <PolarisTextField
            label="E1. จำนวนครั้งที่ฉีดพ่นในระยะนี้"
            type="number"
            :modelValue="stageData?.total_sprays ?? 0"
            @update:modelValue="updateTotalSprays(Number($event) || 0)"
            :min="0"
            :max="20"
            suffix="ครั้ง"
          />

          <template v-if="(stageData?.total_sprays || 0) > 0">
            <div
              v-for="(app, idx) in applications"
              :key="idx"
              class="spray-panel__app"
            >
              <PolarisText variant="headingSm">ครั้งที่ {{ idx + 1 }}</PolarisText>
              <div class="spray-panel__fields">
                <PolarisTextField
                  label="E2. ชื่อผลิตภัณฑ์/ยี่ห้อ"
                  :modelValue="app.product"
                  @update:modelValue="updateApp(idx, 'product', $event)"
                  placeholder="ระบุชื่อยา"
                />
                <PolarisSelect
                  label="E3. ประเภทสาร"
                  :options="typeOptions"
                  :modelValue="app.type"
                  @update:modelValue="updateApp(idx, 'type', $event)"
                />
                <PolarisTextField
                  label="E4. ปริมาณที่ใช้"
                  :modelValue="app.amount"
                  @update:modelValue="updateApp(idx, 'amount', $event)"
                  placeholder="เช่น 100 มล./ไร่"
                />
                <PolarisTextField
                  label="E5. จำนวนน้ำ (ลิตร/ไร่)"
                  type="number"
                  :modelValue="app.water_liters"
                  @update:modelValue="updateApp(idx, 'water_liters', $event ? Number($event) : null)"
                  suffix="ลิตร/ไร่"
                />
              </div>
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
  PolarisTextField, PolarisSelect, PolarisBlockStack, PolarisText,
} from 'polaris-weweb-styles/components'
import { SPRAY_TYPE_OPTIONS } from '../constants.js'

export default {
  components: {
    PolarisCard, PolarisCardHeader, PolarisCardSection,
    PolarisTextField, PolarisSelect, PolarisBlockStack, PolarisText,
  },
  props: {
    stageKey: { type: String, required: true },
    stageLabel: { type: String, required: true },
    modelValue: { type: Object, default: () => ({ total_sprays: 0, applications: [] }) },
  },
  emits: ['update:modelValue'],
  computed: {
    typeOptions() {
      return SPRAY_TYPE_OPTIONS
    },
    stageData() {
      return this.modelValue || { total_sprays: 0, applications: [] }
    },
    applications() {
      const count = this.stageData?.total_sprays || 0
      const existing = this.stageData?.applications || []
      const result = []
      for (let i = 0; i < count; i++) {
        result.push(existing[i] || { product: '', type: '', amount: '', water_liters: null })
      }
      return result
    },
  },
  methods: {
    updateTotalSprays(count) {
      const clamped = Math.max(0, Math.min(20, count))
      const apps = [...(this.stageData?.applications || [])]
      while (apps.length < clamped) {
        apps.push({ product: '', type: '', amount: '', water_liters: null })
      }
      this.$emit('update:modelValue', {
        total_sprays: clamped,
        applications: apps.slice(0, clamped),
      })
    },
    updateApp(idx, field, value) {
      const apps = this.applications.map((a, i) =>
        i === idx ? { ...a, [field]: value } : { ...a }
      )
      this.$emit('update:modelValue', {
        total_sprays: this.stageData?.total_sprays || 0,
        applications: apps,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
@import 'polaris-weweb-styles';

.spray-panel {
  &__app {
    display: flex;
    flex-direction: column;
    gap: var(--p-space-300);
    padding: var(--p-space-300);
    border: var(--p-border-width-025) solid var(--p-color-border);
    border-radius: var(--p-border-radius-200);
    background: var(--p-color-bg-surface-secondary);
  }

  &__fields {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--p-space-300);

    @media (min-width: 768px) {
      grid-template-columns: 1fr 1fr;
    }
  }
}
</style>
