<template>
  <div class="outcomes-tab">
    <PolarisInline gap="200" blockAlign="center" align="space-between">
      <PolarisText variant="headingMd">Outcomes ({{ outcomes?.length || 0 }})</PolarisText>
      <PolarisButton variant="primary" icon="plus" @click="addOutcome">Add Outcome</PolarisButton>
    </PolarisInline>

    <PolarisEmptyState v-if="!outcomes?.length" icon="📊" heading="No outcomes defined" compact>
      Define the outcomes you want to track so the AI can learn what works.
      <template #actions>
        <PolarisButton variant="primary" @click="addOutcome">Add Outcome</PolarisButton>
      </template>
    </PolarisEmptyState>

    <div v-else class="outcomes-list">
      <PolarisCard
        v-for="(outcome, idx) in outcomes"
        :key="outcome?.id || outcome?._tempId || idx"
      >
        <PolarisCardHeader :title="`Outcome ${idx + 1}`">
          <template #action>
            <PolarisButton variant="plain" icon="delete" iconOnly @click="removeOutcome(idx)" />
          </template>
        </PolarisCardHeader>
        <PolarisCardSection>
          <PolarisBlockStack gap="400">
            <!-- Event Type -->
            <div>
              <PolarisSelect
                label="Event Type"
                required
                :modelValue="outcome?.event_type || ''"
                @update:modelValue="handleEventTypeChange(idx, $event)"
                :options="eventTypeOptions"
                placeholder="Select event type..."
              />
              <PolarisText
                v-if="getEventTypeDescription(outcome?.event_type)"
                variant="bodySm"
                color="subdued"
              >{{ getEventTypeDescription(outcome?.event_type) }}</PolarisText>
            </div>

            <!-- Classification -->
            <ClassificationPicker
              :modelValue="outcome?.classification || ''"
              @update:modelValue="updateOutcome(idx, 'classification', $event)"
            />

            <!-- Weight Column (only when event type has weight_columns) -->
            <PolarisSelect
              v-if="getWeightColumnOptions(outcome?.event_type).length > 0"
              label="Weight Column"
              :modelValue="outcome?.weight_column || ''"
              @update:modelValue="updateOutcome(idx, 'weight_column', $event)"
              :options="getWeightColumnOptions(outcome?.event_type)"
              placeholder="Select weight column..."
              helpText="Numeric column to sum for this outcome (e.g. purchase amount)"
            />

            <!-- Attribution Window -->
            <PolarisTextField
              label="Attribution Window (hours)"
              type="number"
              :modelValue="outcome?.attribution_window_hours ?? 168"
              @update:modelValue="updateOutcome(idx, 'attribution_window_hours', parseInt($event) || 168)"
              helpText="How long after the agent acts to attribute this outcome"
              :min="1"
            />

            <!-- Counting Method -->
            <PolarisSelect
              label="Counting Method"
              :modelValue="outcome?.counting_method || 'cumulative'"
              @update:modelValue="updateOutcome(idx, 'counting_method', $event)"
              :options="countingMethodOptions"
            />

            <!-- Primary Outcome Toggle -->
            <div class="primary-toggle">
              <label class="toggle-switch">
                <input
                  type="checkbox"
                  :checked="outcome?.is_primary || false"
                  @change="togglePrimary(idx, $event.target.checked)"
                />
                <span class="toggle-switch__slider"></span>
              </label>
              <div class="primary-toggle__text">
                <span class="primary-toggle__label">Primary Outcome</span>
                <span class="primary-toggle__help">The main KPI the AI optimizes for. Only one outcome per agent can be primary.</span>
              </div>
            </div>

            <!-- Contextual helper when is_primary is true -->
            <PolarisBanner
              v-if="outcome?.is_primary"
              variant="info"
            >Target conversion rate applies to the primary outcome</PolarisBanner>

            <!-- Target Conversion Rate (only when is_primary) -->
            <PolarisTextField
              v-if="outcome?.is_primary"
              label="Target Conversion Rate"
              type="number"
              :modelValue="displayConversionRate(outcome?.target_conversion_rate)"
              @update:modelValue="updateConversionRate(idx, $event)"
              suffix="%"
              helpText="Expected conversion percentage for this outcome"
              :min="0"
              :max="100"
              :step="0.1"
            />

            <!-- Event Filter (collapsible) -->
            <PolarisCard v-if="getFilterableFields(outcome?.event_type).length > 0">
              <PolarisConfigSection
                icon="🔍"
                title="Event Filter"
                subtitle="Optional — only count events matching these criteria"
                collapsible
                :defaultOpen="hasEventFilter(outcome)"
              >
                <ConditionBuilder
                  :modelValue="outcome?.event_filter || { match: 'all', groups: [] }"
                  @update:modelValue="updateOutcome(idx, 'event_filter', $event)"
                  :collections="collections"
                  :filterableFields="getFilterableFields(outcome?.event_type)"
                />
              </PolarisConfigSection>
            </PolarisCard>
          </PolarisBlockStack>
        </PolarisCardSection>
      </PolarisCard>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import {
  PolarisTextField, PolarisSelect, PolarisButton, PolarisText,
  PolarisCard, PolarisCardHeader, PolarisCardSection, PolarisBlockStack,
  PolarisInline, PolarisEmptyState, PolarisConfigSection, PolarisBanner,
} from 'polaris-weweb-styles/components';
import ClassificationPicker from './ClassificationPicker.vue';
import ConditionBuilder from './ConditionBuilder.vue';

const uid = () => crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default {
  name: 'OutcomesTab',
  components: {
    PolarisTextField, PolarisSelect, PolarisButton, PolarisText,
    PolarisCard, PolarisCardHeader, PolarisCardSection, PolarisBlockStack,
    PolarisInline, PolarisEmptyState, PolarisConfigSection, PolarisBanner,
    ClassificationPicker, ConditionBuilder,
  },
  props: {
    outcomes: { type: Array, default: () => [] },
    collections: { type: Array, default: () => [] },
    outcomeEventConfigs: { type: Array, default: () => [] },
  },
  emits: ['update'],
  setup(props, { emit }) {
    const countingMethodOptions = [
      { value: 'cumulative', label: 'Cumulative — count every event' },
      { value: 'binary', label: 'Binary — happened or not' },
    ];

    const eventTypeOptions = computed(() =>
      (props.outcomeEventConfigs || []).map(c => ({
        value: c?.event_type || '',
        label: c?.display_label || c?.event_type || '',
      }))
    );

    const getConfigForEventType = (eventType) => {
      if (!eventType) return null;
      return (props.outcomeEventConfigs || []).find(c => c?.event_type === eventType) || null;
    };

    const getEventTypeDescription = (eventType) => {
      return getConfigForEventType(eventType)?.description || '';
    };

    const getWeightColumnOptions = (eventType) => {
      const config = getConfigForEventType(eventType);
      const cols = config?.weight_columns || [];
      return cols.map(c => ({ value: c?.key || '', label: c?.label || c?.key || '' }));
    };

    const getFilterableFields = (eventType) => {
      const config = getConfigForEventType(eventType);
      return config?.filterable_fields || [];
    };

    const hasEventFilter = (outcome) => {
      const ef = outcome?.event_filter;
      return ef?.groups?.length > 0;
    };

    const displayConversionRate = (storedValue) => {
      if (storedValue == null || storedValue === '') return '';
      return Math.round(Number(storedValue) * 10000) / 100;
    };

    const updateConversionRate = (idx, uiValue) => {
      const decimal = uiValue !== '' && uiValue != null
        ? Math.round(Number(uiValue) * 100) / 10000
        : null;
      updateOutcome(idx, 'target_conversion_rate', decimal);
    };

    const addOutcome = () => {
      const list = [...(props.outcomes || [])];
      list.push({
        _tempId: uid(),
        event_type: '',
        event_filter: { match: 'all', groups: [] },
        classification: '',
        weight_column: '',
        attribution_window_hours: 168,
        counting_method: 'cumulative',
        is_primary: false,
        target_conversion_rate: null,
        sort_order: list.length + 1,
      });
      emit('update', list);
    };

    const removeOutcome = (idx) => {
      const list = [...(props.outcomes || [])];
      list.splice(idx, 1);
      emit('update', list);
    };

    const updateOutcome = (idx, field, value) => {
      const list = (props.outcomes || []).map((o, i) =>
        i === idx ? { ...o, [field]: value } : o
      );
      emit('update', list);
    };

    const handleEventTypeChange = (idx, newType) => {
      const config = getConfigForEventType(newType);
      const weightCols = config?.weight_columns || [];

      const list = (props.outcomes || []).map((o, i) => {
        if (i !== idx) return o;
        return {
          ...o,
          event_type: newType,
          classification: config?.default_classification || 'good',
          attribution_window_hours: config?.attribution_window_hours ?? 168,
          counting_method: config?.counting_method || 'cumulative',
          weight_column: weightCols.length ? null : null,
        };
      });
      emit('update', list);
    };

    const togglePrimary = (idx, checked) => {
      const list = (props.outcomes || []).map((o, i) => {
        if (i === idx) {
          return { ...o, is_primary: checked };
        }
        if (checked) {
          return { ...o, is_primary: false };
        }
        return o;
      });
      emit('update', list);
    };

    return {
      countingMethodOptions, eventTypeOptions,
      getEventTypeDescription, getWeightColumnOptions, getFilterableFields,
      hasEventFilter, displayConversionRate, updateConversionRate,
      addOutcome, removeOutcome, updateOutcome,
      handleEventTypeChange, togglePrimary,
    };
  },
};
</script>

<style lang="scss" scoped>
.outcomes-tab {
  display: flex;
  flex-direction: column;
  gap: var(--p-space-400);

  input[type="radio"],
  input[type="checkbox"] {
    accent-color: var(--p-color-bg-fill-brand, #2C6ECB);
  }
}

.outcomes-list {
  display: flex;
  flex-direction: column;
  gap: var(--p-space-300);
}

.primary-toggle {
  display: flex;
  align-items: flex-start;
  gap: var(--p-space-300);

  &__text {
    display: flex;
    flex-direction: column;
    gap: var(--p-space-050);
  }

  &__label {
    font-size: var(--p-font-size-325);
    font-weight: var(--p-font-weight-semibold);
    color: var(--p-color-text);
  }

  &__help {
    font-size: var(--p-font-size-275);
    color: var(--p-color-text-secondary);
  }
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  &__slider {
    position: absolute;
    inset: 0;
    background: var(--p-color-bg-fill-disabled);
    border-radius: 10px;
    transition: background var(--p-motion-duration-150) var(--p-motion-ease);

    &::before {
      content: '';
      position: absolute;
      left: 2px;
      top: 2px;
      width: 16px;
      height: 16px;
      background: white;
      border-radius: 50%;
      transition: transform var(--p-motion-duration-150) var(--p-motion-ease);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    }
  }

  input:checked + &__slider {
    background: var(--p-color-bg-fill-success);

    &::before {
      transform: translateX(16px);
    }
  }
}
</style>
