<template>
  <div class="classification-picker">
    <label v-if="label" class="classification-picker__label">{{ label }}</label>
    <div class="classification-picker__options">
      <button
        v-for="opt in options"
        :key="opt.value"
        class="classification-option"
        :class="{ 'classification-option--selected': modelValue === opt.value }"
        @click="$emit('update:modelValue', opt.value)"
        type="button"
      >
        <div class="classification-option__bars">
          <span
            v-for="n in opt.bars"
            :key="n"
            class="classification-option__bar"
            :class="`classification-option__bar--${opt.color}`"
          ></span>
        </div>
        <span class="classification-option__label">{{ opt.label }}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ClassificationPicker',
  props: {
    modelValue: { type: String, default: '' },
    label: { type: String, default: 'Classification' },
  },
  emits: ['update:modelValue'],
  setup() {
    const options = [
      { value: 'best', label: 'Best', bars: 3, color: 'green' },
      { value: 'very_good', label: 'Very good', bars: 2, color: 'green' },
      { value: 'good', label: 'Good', bars: 1, color: 'green' },
      { value: 'bad', label: 'Bad', bars: 1, color: 'red' },
      { value: 'very_bad', label: 'Very bad', bars: 2, color: 'red' },
      { value: 'worst', label: 'Worst', bars: 3, color: 'red' },
    ];
    return { options };
  },
};
</script>

<style lang="scss" scoped>
@import 'polaris-weweb-styles';

.classification-picker {
  display: flex;
  flex-direction: column;
  gap: var(--p-space-200);

  &__label {
    @include polaris-label;
  }

  &__options {
    display: flex;
    gap: var(--p-space-100);
    flex-wrap: wrap;
  }
}

.classification-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--p-space-100);
  padding: var(--p-space-200) var(--p-space-300);
  border: var(--p-border-width-025) solid var(--p-color-border);
  border-radius: var(--p-border-radius-200);
  background: var(--p-color-bg-surface);
  cursor: pointer;
  transition: all var(--p-motion-duration-150) var(--p-motion-ease);
  min-width: 64px;

  &:hover {
    background: var(--p-color-bg-surface-hover);
    border-color: var(--p-color-border-hover);
  }

  &--selected {
    border-color: var(--p-color-border-focus);
    background: var(--p-color-bg-surface-selected);
    box-shadow: 0 0 0 1px var(--p-color-border-focus);
  }

  &__bars {
    display: flex;
    gap: 2px;
    height: 16px;
    align-items: flex-end;
  }

  &__bar {
    width: 6px;
    border-radius: 1px;

    &--green {
      background: var(--p-color-bg-fill-success);
      height: 100%;
    }

    &--red {
      background: var(--p-color-bg-fill-critical);
      height: 100%;
    }
  }

  &__label {
    font-size: var(--p-font-size-275);
    color: var(--p-color-text-secondary);
    white-space: nowrap;

    .classification-option--selected & {
      color: var(--p-color-text);
      font-weight: var(--p-font-weight-medium);
    }
  }
}
</style>
