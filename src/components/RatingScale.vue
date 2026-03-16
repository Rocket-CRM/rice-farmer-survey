<template>
  <div class="rating-scale">
    <span v-if="lowLabel" class="rating-scale__label rating-scale__label--low">{{ lowLabel }}</span>
    <div class="rating-scale__options">
      <label
        v-for="n in max - min + 1"
        :key="n"
        class="rating-scale__option"
        :class="{
          'rating-scale__option--selected': modelValue === min + n - 1,
          [`rating-scale__option--level-${min + n - 1}`]: modelValue === min + n - 1,
        }"
      >
        <input
          type="radio"
          :name="name"
          :value="min + n - 1"
          :checked="modelValue === min + n - 1"
          @change="$emit('update:modelValue', min + n - 1)"
        />
        <span class="rating-scale__circle">{{ min + n - 1 }}</span>
      </label>
    </div>
    <span v-if="highLabel" class="rating-scale__label rating-scale__label--high">{{ highLabel }}</span>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: { type: Number, default: null },
    min: { type: Number, default: 1 },
    max: { type: Number, default: 5 },
    lowLabel: { type: String, default: '' },
    highLabel: { type: String, default: '' },
    name: { type: String, default: () => `rating-${Math.random().toString(36).slice(2, 9)}` },
  },
  emits: ['update:modelValue'],
}
</script>

<style lang="scss" scoped>
@import 'polaris-weweb-styles';

.rating-scale {
  display: flex;
  align-items: center;
  gap: var(--p-space-200);
  flex-wrap: wrap;

  &__label {
    font-size: var(--p-font-size-275);
    color: var(--p-color-text-secondary);
    white-space: nowrap;
  }

  &__options {
    display: flex;
    gap: var(--p-space-100);
  }

  &__option {
    cursor: pointer;

    input { position: absolute; opacity: 0; width: 0; height: 0; }
  }

  &__circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: var(--p-border-width-025) solid var(--p-color-border);
    font-size: var(--p-font-size-300);
    font-weight: var(--p-font-weight-medium);
    color: var(--p-color-text-secondary);
    background: var(--p-color-bg-surface);
    transition: all var(--p-motion-duration-150) var(--p-motion-ease);
  }

  &__option:hover .rating-scale__circle {
    border-color: var(--p-color-border-hover);
    background: var(--p-color-bg-surface-hover);
  }

  &__option--selected .rating-scale__circle {
    color: #fff;
    font-weight: var(--p-font-weight-bold);
  }

  &__option--level-1 .rating-scale__circle {
    border-color: #22a06b;
    background: #22a06b;
  }
  &__option--level-2 .rating-scale__circle {
    border-color: #6cc644;
    background: #6cc644;
  }
  &__option--level-3 .rating-scale__circle {
    border-color: #e2a100;
    background: #e2a100;
  }
  &__option--level-4 .rating-scale__circle {
    border-color: #e97b2c;
    background: #e97b2c;
  }
  &__option--level-5 .rating-scale__circle {
    border-color: #d32f2f;
    background: #d32f2f;
  }
}
</style>
