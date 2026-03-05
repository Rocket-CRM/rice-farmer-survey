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
              <PolarisTextField
                labelHidden
                label="พันธุ์ข้าว"
                placeholder="เช่น กข61"
                :modelValue="row.variety"
                @update:modelValue="updateField(idx, 'variety', $event)"
              />
            </td>
            <td>
              <PolarisTextField
                labelHidden
                label="อายุเก็บเกี่ยว"
                type="number"
                placeholder="วัน"
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
export default {
  props: {
    modelValue: {
      type: Array,
      default: () => [{ variety: '', harvest_days: null }],
    },
  },
  emits: ['update:modelValue'],
  computed: {
    rows() {
      return this.modelValue?.length ? this.modelValue : [{ variety: '', harvest_days: null }]
    },
  },
  methods: {
    updateField(idx, field, value) {
      const updated = this.rows.map((r, i) =>
        i === idx ? { ...r, [field]: value } : { ...r }
      )
      this.$emit('update:modelValue', updated)
    },
    addRow() {
      if (this.rows.length >= 5) return
      this.$emit('update:modelValue', [...this.rows, { variety: '', harvest_days: null }])
    },
    removeRow(idx) {
      const updated = this.rows.filter((_, i) => i !== idx)
      this.$emit('update:modelValue', updated.length ? updated : [{ variety: '', harvest_days: null }])
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

  &__action {
    width: 60px;
    text-align: center;
  }
}
</style>
