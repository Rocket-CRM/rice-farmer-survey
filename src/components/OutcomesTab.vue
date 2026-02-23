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
        <PolarisCardSection>
          <PolarisInline gap="200" blockAlign="start" align="space-between">
            <PolarisText variant="headingSm">Outcome {{ idx + 1 }}</PolarisText>
            <PolarisButton variant="plain" icon="delete" iconOnly @click="removeOutcome(idx)" />
          </PolarisInline>

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

            <PolarisTextField
              label="Weight Column"
              :modelValue="outcome?.weight_column || ''"
              @update:modelValue="updateOutcome(idx, 'weight_column', $event)"
              placeholder="e.g. order_value, final_amount"
              helpText="Optional column name used to weight this outcome's impact"
            />

            <!-- Event Filter (collapsible) -->
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
              />
            </PolarisConfigSection>
          </PolarisBlockStack>
        </PolarisCardSection>
      </PolarisCard>
    </div>
  </div>
</template>

<script>
import {
  PolarisTextField, PolarisSelect, PolarisButton, PolarisText,
  PolarisCard, PolarisCardSection, PolarisBlockStack, PolarisInline,
  PolarisEmptyState, PolarisConfigSection,
} from 'polaris-weweb-styles/components';
import ClassificationPicker from './ClassificationPicker.vue';
import ConditionBuilder from './ConditionBuilder.vue';

const uid = () => crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default {
  name: 'OutcomesTab',
  components: {
    PolarisTextField, PolarisSelect, PolarisButton, PolarisText,
    PolarisCard, PolarisCardSection, PolarisBlockStack, PolarisInline,
    PolarisEmptyState, PolarisConfigSection,
    ClassificationPicker, ConditionBuilder,
  },
  props: {
    outcomes: { type: Array, default: () => [] },
    collections: { type: Array, default: () => [] },
  },
  emits: ['update'],
  setup(props, { emit }) {
    const eventTypeOptions = [
      { value: 'purchase_completed', label: 'Purchase Completed' },
      { value: 'points_earned', label: 'Points Earned' },
      { value: 'form_submitted', label: 'Form Submitted' },
      { value: 'email_clicked', label: 'Email Clicked' },
      { value: 'email_opened', label: 'Email Opened' },
      { value: 'unsubscribed', label: 'Unsubscribed' },
      { value: 'tag_assigned', label: 'Tag Assigned' },
    ];

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
        classification: 'good',
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
      const list = (props.outcomes || []).map((o, i) =>
        i === idx ? { ...o, [field]: value } : o
      );
      emit('update', list);
    };

    return { eventTypeOptions, hasEventFilter, addOutcome, removeOutcome, updateOutcome };
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
