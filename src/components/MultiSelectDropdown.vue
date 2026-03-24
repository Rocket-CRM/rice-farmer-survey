<template>
  <div class="multi-select" ref="rootEl">
    <label
      v-if="label"
      class="multi-select__label"
    >{{ label }}</label>
    <p v-if="helpText" class="multi-select__help">{{ helpText }}</p>

    <div class="multi-select__control">
      <button
        type="button"
        class="multi-select__trigger"
        :class="{
          'multi-select__trigger--open': open,
          'multi-select__trigger--error': !!error,
        }"
        :aria-expanded="open"
        aria-haspopup="listbox"
        @click.stop="toggleOpen"
      >
        <span class="multi-select__value">{{ displayText }}</span>
        <span class="multi-select__icon" aria-hidden="true">
          <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 14a.997.997 0 01-.707-.293l-5-5a.999.999 0 111.414-1.414L10 11.586l4.293-4.293a.999.999 0 111.414 1.414l-5 5A.997.997 0 0110 14z"
              fill="currentColor"
            />
          </svg>
        </span>
      </button>

      <div
        v-show="open"
        class="multi-select__panel"
        role="listbox"
        aria-multiselectable="true"
      >
        <button
          v-for="opt in normalizedOptions"
          :key="opt.value"
          type="button"
          role="option"
          class="multi-select__option"
          :class="{ 'multi-select__option--selected': isSelected(opt.value) }"
          :aria-selected="isSelected(opt.value)"
          :disabled="opt.disabled"
          @click="onOptionClick(opt.value)"
        >
          <span class="multi-select__tick" aria-hidden="true">{{ isSelected(opt.value) ? '✓' : '' }}</span>
          <span class="multi-select__option-label">{{ opt.label }}</span>
        </button>
      </div>
    </div>

    <p v-if="errorMessage" class="multi-select__error" role="alert">{{ errorMessage }}</p>
  </div>
</template>

<script>
export default {
  name: 'MultiSelectDropdown',
  props: {
    label: { type: String, default: '' },
    /** Array of selected option values */
    modelValue: { type: Array, default: () => [] },
    options: { type: Array, default: () => [] },
    placeholder: { type: String, default: 'เลือก...' },
    helpText: { type: String, default: '' },
    error: { type: [String, Boolean], default: null },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      open: false,
    }
  },
  computed: {
    normalizedOptions() {
      return (this.options || []).map((opt) =>
        typeof opt === 'string'
          ? { value: opt, label: opt, disabled: false }
          : {
              value: opt?.value,
              label: opt?.label ?? opt?.value,
              disabled: !!opt?.disabled,
            },
      )
    },
    selected() {
      return Array.isArray(this.modelValue) ? [...this.modelValue] : []
    },
    displayText() {
      const sel = this.selected
      if (!sel.length) return this.placeholder
      const labels = sel.map((v) => {
        const o = this.normalizedOptions.find((x) => x.value === v)
        return o?.label ?? v
      })
      const joined = labels.join(', ')
      if (joined.length > 72) return `${sel.length} รายการที่เลือก`
      return joined
    },
    errorMessage() {
      return typeof this.error === 'string' ? this.error : null
    },
  },
  mounted() {
    this._onDocClick = (e) => {
      if (this.$refs.rootEl && !this.$refs.rootEl.contains(e.target)) this.open = false
    }
    document.addEventListener('click', this._onDocClick)
  },
  beforeUnmount() {
    document.removeEventListener('click', this._onDocClick)
  },
  methods: {
    isSelected(value) {
      return this.selected.includes(value)
    },
    toggleOpen() {
      this.open = !this.open
    },
    onOptionClick(value) {
      const next = [...this.selected]
      const i = next.indexOf(value)
      if (i >= 0) next.splice(i, 1)
      else next.push(value)
      this.$emit('update:modelValue', next)
    },
  },
}
</script>

<style lang="scss" scoped>
@import 'polaris-weweb-styles';

.multi-select {
  display: flex;
  flex-direction: column;
  gap: var(--p-space-100);
  position: relative;
}

.multi-select__label {
  font-family: var(--p-font-family-sans);
  font-size: var(--p-font-size-350);
  font-weight: var(--p-font-weight-medium);
  line-height: var(--p-font-line-height-400);
  color: var(--p-color-text);
}

.multi-select__help {
  margin: 0;
  font-family: var(--p-font-family-sans);
  font-size: var(--p-font-size-300);
  color: var(--p-color-text-secondary);
  line-height: var(--p-font-line-height-300);
}

.multi-select__control {
  position: relative;
}

.multi-select__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 36px;
  padding: var(--p-space-200) var(--p-space-800) var(--p-space-200) var(--p-space-300);
  font-family: var(--p-font-family-sans);
  font-size: var(--p-font-size-350);
  line-height: var(--p-font-line-height-400);
  color: var(--p-color-text);
  text-align: left;
  background: var(--p-color-bg-surface);
  border: 1px solid var(--p-color-border);
  border-radius: var(--p-border-radius-200);
  box-shadow: var(--p-shadow-inset-100);
  cursor: pointer;
  box-sizing: border-box;
  transition:
    border-color var(--p-motion-duration-150) var(--p-motion-ease),
    box-shadow var(--p-motion-duration-150) var(--p-motion-ease);
}

.multi-select__trigger:hover:not(:disabled) {
  border-color: var(--p-color-border-hover);
}

.multi-select__trigger:focus {
  outline: none;
  border-color: var(--p-color-focus-ring);
  box-shadow: 0 0 0 1px var(--p-color-focus-ring);
}

.multi-select__trigger--open {
  border-color: var(--p-color-focus-ring);
}

.multi-select__trigger--error {
  border-color: var(--p-color-border-critical);
}

.multi-select__value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: var(--p-space-200);
}

.multi-select__icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--p-color-icon);
  pointer-events: none;
}

.multi-select__icon svg {
  width: 100%;
  height: 100%;
  transition: transform var(--p-motion-duration-150) var(--p-motion-ease);
}

.multi-select__trigger--open .multi-select__icon {
  transform: rotate(180deg);
}

.multi-select__panel {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 2px);
  z-index: 50;
  max-height: 240px;
  overflow-y: auto;
  background: var(--p-color-bg-surface);
  border: 1px solid var(--p-color-border);
  border-radius: var(--p-border-radius-200);
  box-shadow: var(--p-shadow-300);
}

.multi-select__option {
  display: flex;
  align-items: flex-start;
  gap: var(--p-space-200);
  width: 100%;
  padding: var(--p-space-200) var(--p-space-300);
  font-family: var(--p-font-family-sans);
  font-size: var(--p-font-size-350);
  line-height: var(--p-font-line-height-400);
  color: var(--p-color-text);
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  box-sizing: border-box;
}

.multi-select__option:hover:not(:disabled) {
  background: var(--p-color-bg-surface-hover);
}

.multi-select__option--selected {
  background: var(--p-color-bg-surface-secondary);
  font-weight: var(--p-font-weight-medium);
}

.multi-select__option:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.multi-select__tick {
  flex-shrink: 0;
  width: 1.25em;
  color: var(--p-color-text-success);
  font-weight: var(--p-font-weight-bold);
}

.multi-select__option-label {
  flex: 1;
  overflow-wrap: break-word;
}

.multi-select__error {
  margin: 0;
  font-family: var(--p-font-family-sans);
  font-size: var(--p-font-size-300);
  color: var(--p-color-text-critical);
  line-height: var(--p-font-line-height-300);
}
</style>
