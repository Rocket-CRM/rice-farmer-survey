<template>
  <div class="assessment-matrix">
    <PolarisText variant="headingSm">{{ title }}</PolarisText>
    <PolarisText variant="bodySm" color="subdued">เลือกรายการที่พบในนาข้าว แล้วให้คะแนนระดับความเสียหายและความยากง่ายในการควบคุม</PolarisText>

    <div class="assessment-matrix__list">
      <div
        v-for="(item, idx) in items"
        :key="item.code"
        class="assessment-matrix__item"
        :class="{
          'assessment-matrix__item--found': localItems[idx]?.found,
        }"
      >
        <div class="assessment-matrix__check-row">
          <PolarisCheckbox
            :label="getLabel(item, idx)"
            :modelValue="localItems[idx]?.found || false"
            @update:modelValue="toggleFound(idx, $event)"
          />
        </div>

        <template v-if="localItems[idx]?.found">
          <div class="assessment-matrix__detail">
            <div v-if="item.hasCustomInput" class="assessment-matrix__custom">
              <PolarisTextField
                label="ระบุชื่อ"
                :modelValue="localItems[idx]?.custom_name || ''"
                @update:modelValue="updateField(idx, 'custom_name', $event)"
                size="slim"
              />
            </div>

            <div v-if="showStages" class="assessment-matrix__stages">
              <PolarisText variant="bodySm" fontWeight="semibold">ระยะที่เจอ</PolarisText>
              <div class="assessment-matrix__stage-checks">
                <PolarisCheckbox
                  v-for="stage in stages"
                  :key="stage.value"
                  :label="stage.label"
                  :modelValue="(localItems[idx]?.stages || []).includes(stage.value)"
                  @update:modelValue="toggleStage(idx, stage.value, $event)"
                />
              </div>
            </div>

            <div class="assessment-matrix__rating-row">
              <div class="assessment-matrix__rating-group">
                <PolarisText variant="bodySm" fontWeight="semibold">{{ damageLabel }}</PolarisText>
                <RatingScale
                  :modelValue="localItems[idx]?.damage"
                  :name="`damage-${item.code}`"
                  lowLabel="1=น้อย"
                  highLabel="5=มาก"
                  @update:modelValue="updateField(idx, 'damage', $event)"
                />
              </div>
              <div class="assessment-matrix__rating-group">
                <PolarisText variant="bodySm" fontWeight="semibold">{{ controlLabel }}</PolarisText>
                <RatingScale
                  :modelValue="localItems[idx]?.control_difficulty"
                  :name="`control-${item.code}`"
                  lowLabel="1=ง่าย"
                  highLabel="5=ยาก"
                  @update:modelValue="updateField(idx, 'control_difficulty', $event)"
                />
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import {
  PolarisCheckbox, PolarisTextField, PolarisText,
} from 'polaris-weweb-styles/components'
import { GROWTH_STAGES } from '../constants.js'
import RatingScale from './RatingScale.vue'

export default {
  components: { PolarisCheckbox, PolarisTextField, PolarisText, RatingScale },
  props: {
    title: { type: String, required: true },
    items: { type: Array, required: true },
    modelValue: { type: Object, default: () => ({ items: [] }) },
    showStages: { type: Boolean, default: false },
    damageLabel: { type: String, default: 'ระดับความเสียหาย' },
    controlLabel: { type: String, default: 'ความยากง่ายในการควบคุม' },
  },
  emits: ['update:modelValue'],
  computed: {
    stages() { return GROWTH_STAGES },
    localItems() { return this.modelValue?.items || [] },
  },
  methods: {
    getLabel(item, idx) {
      const base = item.label || ''
      if (item.hasCustomInput && this.localItems[idx]?.custom_name) {
        return `${base}: ${this.localItems[idx].custom_name}`
      }
      return base
    },
    emitUpdate(updated) {
      this.$emit('update:modelValue', { items: updated })
    },
    toggleFound(idx, found) {
      const updated = this.localItems.map((it, i) => {
        if (i !== idx) return { ...it }
        return {
          ...it,
          found,
          damage: found ? it.damage : null,
          control_difficulty: found ? it.control_difficulty : null,
          stages: found ? (it.stages || []) : [],
        }
      })
      this.emitUpdate(updated)
    },
    updateField(idx, field, value) {
      const updated = this.localItems.map((it, i) =>
        i === idx ? { ...it, [field]: value } : { ...it }
      )
      this.emitUpdate(updated)
    },
    toggleStage(idx, stageVal, checked) {
      const current = [...(this.localItems[idx]?.stages || [])]
      const next = checked
        ? [...current, stageVal]
        : current.filter(v => v !== stageVal)
      this.updateField(idx, 'stages', next)
    },
  },
}
</script>

<style lang="scss" scoped>
@import 'polaris-weweb-styles';

.assessment-matrix {
  display: flex;
  flex-direction: column;
  gap: var(--p-space-300);

  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--p-space-100);
  }

  &__item {
    border: var(--p-border-width-025) solid var(--p-color-border);
    border-radius: var(--p-border-radius-200);
    background: var(--p-color-bg-surface);
    overflow: hidden;
    transition: border-color var(--p-motion-duration-150) var(--p-motion-ease);

    &--found {
      border-color: var(--p-color-border-focus);
    }

  }

  &__check-row {
    padding: var(--p-space-200) var(--p-space-300);
  }

  &__detail {
    padding: 0 var(--p-space-300) var(--p-space-300);
    padding-top: 0;
    display: flex;
    flex-direction: column;
    gap: var(--p-space-300);
    border-top: var(--p-border-width-025) solid var(--p-color-border);
    padding-top: var(--p-space-300);
    background: var(--p-color-bg-surface-secondary);
  }

  &__custom {
    max-width: 300px;
  }

  &__stages {
    display: flex;
    flex-direction: column;
    gap: var(--p-space-150);
  }

  &__stage-checks {
    display: flex;
    flex-wrap: wrap;
    gap: var(--p-space-200) var(--p-space-400);
  }

  &__rating-row {
    display: flex;
    flex-direction: column;
    gap: var(--p-space-300);

    @media (min-width: 768px) {
      flex-direction: row;
      gap: var(--p-space-600);
    }
  }

  &__rating-group {
    display: flex;
    flex-direction: column;
    gap: var(--p-space-150);
  }
}
</style>
