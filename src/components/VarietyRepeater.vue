<template>
  <div class="variety-repeater">
    <PolarisText variant="headingSm">A6. พันธุ์ข้าวที่ปลูก</PolarisText>
    <div class="variety-repeater__table-wrap">
      <table class="variety-repeater__table">
        <thead>
          <tr>
            <th>A6.1 พันธุ์ข้าว</th>
            <th>A6.2 อายุเก็บเกี่ยว (วัน)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in rows" :key="idx">
            <td>
              <PolarisSelect
                labelHidden
                label="พันธุ์ข้าว"
                :options="varietyOptions"
                :modelValue="row.variety === 'other' || isCustomVariety(row.variety) ? 'other' : row.variety"
                @update:modelValue="onVarietySelect(idx, $event)"
                placeholder="เลือกพันธุ์ข้าว"
              />
              <PolarisTextField
                v-if="row.variety === 'other' || (row.custom_variety != null && row.custom_variety !== '')"
                labelHidden
                label="ระบุพันธุ์ข้าว"
                placeholder="ระบุพันธุ์ข้าว"
                :modelValue="row.custom_variety || ''"
                @update:modelValue="updateField(idx, 'custom_variety', $event)"
                class="variety-repeater__custom-input"
              />
            </td>
            <td>
              <PolarisTextField
                labelHidden
                label="อายุเก็บเกี่ยว"
                type="number"
                placeholder="วัน"
                suffix="วัน"
                :modelValue="row.harvest_days"
                @update:modelValue="updateField(idx, 'harvest_days', $event ? Number($event) : null)"
              />
            </td>
            <td class="variety-repeater__action">
              <PolarisButton
                v-if="rows.length > 1"
                variant="plain"
                size="slim"
                @click="removeRow(idx)"
              >
                ลบ
              </PolarisButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <PolarisButton
      v-if="rows.length < 5"
      variant="plain"
      @click="addRow"
    >
      + เพิ่มพันธุ์
    </PolarisButton>
  </div>
</template>

<script>
import {
  PolarisText, PolarisTextField, PolarisSelect, PolarisButton,
} from 'polaris-weweb-styles/components'
import { RICE_VARIETY_OPTIONS } from '../constants.js'

export default {
  components: { PolarisText, PolarisTextField, PolarisSelect, PolarisButton },
  props: {
    modelValue: {
      type: Array,
      default: () => [{ variety: '', custom_variety: '', harvest_days: null }],
    },
  },
  emits: ['update:modelValue'],
  computed: {
    varietyOptions() {
      return RICE_VARIETY_OPTIONS
    },
    rows() {
      return this.modelValue?.length
        ? this.modelValue
        : [{ variety: '', custom_variety: '', harvest_days: null }]
    },
  },
  methods: {
    isCustomVariety(val) {
      if (!val) return false
      return !RICE_VARIETY_OPTIONS.some(o => o.value === val)
    },
    onVarietySelect(idx, value) {
      if (value === 'other') {
        const updated = this.rows.map((r, i) =>
          i === idx ? { ...r, variety: 'other', custom_variety: r.custom_variety || '' } : { ...r }
        )
        this.$emit('update:modelValue', updated)
      } else {
        const updated = this.rows.map((r, i) =>
          i === idx ? { ...r, variety: value, custom_variety: '' } : { ...r }
        )
        this.$emit('update:modelValue', updated)
      }
    },
    updateField(idx, field, value) {
      const updated = this.rows.map((r, i) =>
        i === idx ? { ...r, [field]: value } : { ...r }
      )
      this.$emit('update:modelValue', updated)
    },
    addRow() {
      if (this.rows.length >= 5) return
      this.$emit('update:modelValue', [...this.rows, { variety: '', custom_variety: '', harvest_days: null }])
    },
    removeRow(idx) {
      const updated = this.rows.filter((_, i) => i !== idx)
      this.$emit('update:modelValue', updated.length ? updated : [{ variety: '', custom_variety: '', harvest_days: null }])
    },
  },
}
</script>

<style lang="scss" scoped>
@import 'polaris-weweb-styles';

.variety-repeater {
  display: flex;
  flex-direction: column;
  gap: var(--p-space-300);

  &__table-wrap {
    overflow-x: auto;
    border: var(--p-border-width-025) solid var(--p-color-border);
    border-radius: var(--p-border-radius-200);
    background: var(--p-color-bg-surface);
  }

  &__table {
    width: 100%;
    border-collapse: collapse;

    th {
      text-align: left;
      padding: var(--p-space-200) var(--p-space-300);
      font-size: var(--p-font-size-275);
      font-weight: var(--p-font-weight-semibold);
      color: var(--p-color-text-secondary);
      background: var(--p-color-bg-surface-secondary);
      border-bottom: var(--p-border-width-025) solid var(--p-color-border);
    }

    td {
      padding: var(--p-space-200) var(--p-space-300);
      border-bottom: var(--p-border-width-025) solid var(--p-color-border);
      vertical-align: middle;
    }

    tr:last-child td {
      border-bottom: none;
    }
  }

  &__custom-input {
    margin-top: var(--p-space-200);
  }

  &__action {
    width: 60px;
    text-align: center;
  }
}
</style>
