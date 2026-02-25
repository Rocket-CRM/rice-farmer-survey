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
            <PolarisTextField
              label="Name"
              required
              :modelValue="outcome?.name || ''"
              @update:modelValue="updateOutcome(idx, 'name', $event)"
              placeholder="e.g. Purchases, Email Click, Unsubscribe"
            />

            <PolarisSelect
              label="Event Type"
              required
              :modelValue="outcome?.event_type || ''"
              @update:modelValue="updateOutcome(idx, 'event_type', $event)"
              :options="eventTypeOptions"
              placeholder="Select event type..."
            />

            <ClassificationPicker
              :modelValue="outcome?.classification || ''"
              @update:modelValue="updateOutcome(idx, 'classification', $event)"
            />

            <PolarisSelect
              v-if="getWeightColumnOptions(outcome?.event_type).length > 0"
              label="Weight Column"
              :modelValue="outcome?.weight_column || ''"
              @update:modelValue="updateOutcome(idx, 'weight_column', $event)"
              :options="getWeightColumnOptions(outcome?.event_type)"
              placeholder="Select weight column..."
              helpText="Optional — weight this outcome's impact by this value"
            />

            <!-- Event Filter (collapsible) -->
            <PolarisCard>
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
  PolarisInline, PolarisEmptyState, PolarisConfigSection,
} from 'polaris-weweb-styles/components';
import ClassificationPicker from './ClassificationPicker.vue';
import ConditionBuilder from './ConditionBuilder.vue';

const uid = () => crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default {
  name: 'OutcomesTab',
  components: {
    PolarisTextField, PolarisSelect, PolarisButton, PolarisText,
    PolarisCard, PolarisCardHeader, PolarisCardSection, PolarisBlockStack,
    PolarisInline, PolarisEmptyState, PolarisConfigSection,
    ClassificationPicker, ConditionBuilder,
  },
  props: {
    outcomes: { type: Array, default: () => [] },
    collections: { type: Array, default: () => [] },
    outcomeEventConfigs: { type: Array, default: () => [] },
  },
  emits: ['update'],
  setup(props, { emit }) {
    const eventTypeOptions = computed(() =>
      (props.outcomeEventConfigs || []).map(c => ({
        value: c?.event_type || '',
        label: c?.display_label || c?.event_type || '',
      }))
    );

    const getWeightColumnOptions = (eventType) => {
      if (!eventType) return [];
      const config = (props.outcomeEventConfigs || []).find(c => c?.event_type === eventType);
      const cols = config?.weight_columns || [];
      return cols.map(c => ({ value: c?.key || '', label: c?.label || c?.key || '' }));
    };

    const getFilterableFields = (eventType) => {
      if (!eventType) return [];
      const config = (props.outcomeEventConfigs || []).find(c => c?.event_type === eventType);
      return config?.filterable_fields || [];
    };

    const hasEventFilter = (outcome) => {
      const ef = outcome?.event_filter;
      return ef?.groups?.length > 0;
    };

    const addOutcome = () => {
      const list = [...(props.outcomes || [])];
      list.push({
        _tempId: uid(),
        name: '',
        event_type: '',
        event_filter: { match: 'all', groups: [] },
        classification: '',
        weight_column: '',
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
      const list = (props.outcomes || []).map((o, i) => {
        if (i !== idx) return o;
        const updated = { ...o, [field]: value };
        if (field === 'event_type') {
          const config = (props.outcomeEventConfigs || []).find(c => c?.event_type === value);
          const validKeys = (config?.weight_columns || []).map(c => c?.key);
          if (!validKeys.includes(updated.weight_column)) {
            updated.weight_column = '';
          }
          if (!o.classification || o.classification === 'good') {
            updated.classification = config?.default_classification || 'good';
          }
        }
        return updated;
      });
      emit('update', list);
    };

    return {
      eventTypeOptions, getWeightColumnOptions, getFilterableFields,
      hasEventFilter, addOutcome, removeOutcome, updateOutcome,
    };
  },
};
</script>

<style lang="scss" scoped>
.outcomes-tab {
  display: flex;
  flex-direction: column;
  gap: var(--p-space-400);
}

.outcomes-list {
  display: flex;
  flex-direction: column;
  gap: var(--p-space-300);
}
</style>
