<template>
  <div class="condition-builder">
    <PolarisInline v-if="groups?.length > 1" gap="200" blockAlign="center" align="space-between">
      <PolarisText variant="headingSm">{{ title }}</PolarisText>
      <PolarisButtonGroup segmented>
        <PolarisButton :pressed="matchMode === 'all'" @click="updateMatchMode('all')" size="slim">All (AND)</PolarisButton>
        <PolarisButton :pressed="matchMode === 'any'" @click="updateMatchMode('any')" size="slim">Any (OR)</PolarisButton>
      </PolarisButtonGroup>
    </PolarisInline>
    <PolarisText v-else-if="title" variant="headingSm">{{ title }}</PolarisText>

    <div v-if="groups?.length" class="condition-groups">
      <PolarisCard
        v-for="(group, gIdx) in groups"
        :key="group?.id || gIdx"
        subdued
      >
        <PolarisCardSection>
          <PolarisInline gap="200" blockAlign="center" align="space-between">
            <PolarisInline gap="200" blockAlign="center">
              <PolarisText variant="bodyMd">Group {{ gIdx + 1 }}</PolarisText>
              <PolarisButtonGroup v-if="(group?.conditions || []).length > 1" segmented>
                <PolarisButton :pressed="group?.operator === 'AND'" @click="updateGroup(group.id, 'operator', 'AND')" size="slim">AND</PolarisButton>
                <PolarisButton :pressed="group?.operator === 'OR'" @click="updateGroup(group.id, 'operator', 'OR')" size="slim">OR</PolarisButton>
              </PolarisButtonGroup>
            </PolarisInline>
            <PolarisButton variant="plain" icon="close" iconOnly @click="removeGroup(group.id)" />
          </PolarisInline>

          <PolarisSelect
            label="Collection"
            :modelValue="group?.collection || ''"
            @update:modelValue="updateGroup(group.id, 'collection', $event)"
            :options="collectionOptions"
            placeholder="Select collection..."
          />

          <div class="condition-list">
            <div v-for="(cond, cIdx) in (group?.conditions || [])" :key="cond?.id || cIdx" class="condition-row">
              <div v-if="cIdx > 0" class="condition-operator-label">
                <PolarisText variant="bodySm" color="subdued">{{ group?.operator || 'AND' }}</PolarisText>
              </div>
              <div class="condition-fields">
                <div style="flex: 1;">
                  <PolarisSelect
                    label="Field" size="small"
                    :modelValue="cond?.field || ''"
                    @update:modelValue="updateCondition(group.id, cond.id, 'field', $event)"
                    :options="getFieldOptions(group?.collection)"
                    placeholder="Field..."
                  />
                </div>
                <div style="width: 120px; flex-shrink: 0;">
                  <PolarisSelect
                    label="Operator" size="small"
                    :modelValue="cond?.operator || 'equals'"
                    @update:modelValue="updateCondition(group.id, cond.id, 'operator', $event)"
                    :options="getOperatorOptions(group?.collection, cond?.field)"
                  />
                </div>
                <div v-if="isValueRequired(cond?.operator)" style="flex: 1;">
                  <PolarisTextField
                    label="Value"
                    :modelValue="cond?.value ?? ''"
                    @update:modelValue="updateCondition(group.id, cond.id, 'value', $event)"
                  />
                </div>
                <PolarisButton variant="plain" icon="close" iconOnly @click="removeCondition(group.id, cond.id)" />
              </div>
            </div>
          </div>

          <PolarisButton variant="plain" fullWidth @click="addCondition(group.id)">+ Add Condition</PolarisButton>
        </PolarisCardSection>
      </PolarisCard>
    </div>

    <PolarisButton variant="outline" fullWidth @click="addGroup">+ Add Group</PolarisButton>
  </div>
</template>

<script>
import { computed } from 'vue';
import {
  PolarisCard, PolarisCardSection, PolarisInline, PolarisText,
  PolarisSelect, PolarisTextField, PolarisButton, PolarisButtonGroup,
} from 'polaris-weweb-styles/components';

const OPERATORS_BY_TYPE = {
  string: [
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'not equals' },
    { value: 'contains', label: 'contains' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' },
  ],
  number: [
    { value: 'equals', label: '=' },
    { value: 'not_equals', label: '≠' },
    { value: 'greater_than', label: '>' },
    { value: 'greater_than_or_equals', label: '≥' },
    { value: 'less_than', label: '<' },
    { value: 'less_than_or_equals', label: '≤' },
  ],
  boolean: [
    { value: 'is_true', label: 'is true' },
    { value: 'is_false', label: 'is false' },
  ],
  date: [
    { value: 'equals', label: 'equals' },
    { value: 'before', label: 'before' },
    { value: 'after', label: 'after' },
    { value: 'is_empty', label: 'is empty' },
  ],
  uuid: [
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'not equals' },
    { value: 'is_empty', label: 'is empty' },
  ],
  array: [
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'not contains' },
    { value: 'is_empty', label: 'is empty' },
  ],
};

const NO_VALUE_OPERATORS = ['is_empty', 'is_not_empty', 'is_true', 'is_false'];

const uid = () => crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default {
  name: 'ConditionBuilder',
  components: {
    PolarisCard, PolarisCardSection, PolarisInline, PolarisText,
    PolarisSelect, PolarisTextField, PolarisButton, PolarisButtonGroup,
  },
  props: {
    modelValue: { type: Object, default: () => ({ match: 'all', groups: [] }) },
    collections: { type: Array, default: () => [] },
    title: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const groups = computed(() => props.modelValue?.groups || []);
    const matchMode = computed(() => props.modelValue?.match || 'all');

    const collectionOptions = computed(() =>
      (props.collections || []).map(c => ({
        value: c?.name || c?.value || '',
        label: c?.label || c?.name || '',
      }))
    );

    const fieldsMap = computed(() => {
      const map = {};
      (props.collections || []).forEach(c => {
        map[c?.name || c?.value || ''] = (c?.fields || []).map(f => ({
          value: f?.name || '',
          label: f?.label || f?.name || '',
          type: f?.type || 'string',
        }));
      });
      return map;
    });

    const getFieldOptions = (collection) => fieldsMap.value[collection] || [];

    const getFieldType = (collection, fieldName) => {
      const field = (fieldsMap.value[collection] || []).find(f => f.value === fieldName);
      return field?.type || 'string';
    };

    const getOperatorOptions = (collection, fieldName) => {
      const type = getFieldType(collection, fieldName);
      return OPERATORS_BY_TYPE[type] || OPERATORS_BY_TYPE.string;
    };

    const isValueRequired = (operator) => !NO_VALUE_OPERATORS.includes(operator);

    const emitUpdate = (newVal) => emit('update:modelValue', newVal);

    const updateMatchMode = (mode) => emitUpdate({ ...props.modelValue, match: mode });

    const addGroup = () => {
      const newGroup = {
        id: uid(),
        type: 'simple',
        collection: '',
        operator: 'AND',
        conditions: [{ id: uid(), field: '', operator: 'equals', value: '' }],
      };
      emitUpdate({ ...props.modelValue, groups: [...groups.value, newGroup] });
    };

    const removeGroup = (groupId) => {
      emitUpdate({
        ...props.modelValue,
        groups: groups.value.filter(g => g.id !== groupId),
      });
    };

    const updateGroup = (groupId, field, value) => {
      const updated = groups.value.map(g => {
        if (g.id !== groupId) return g;
        const out = { ...g, [field]: value };
        if (field === 'collection') {
          out.conditions = [{ id: uid(), field: '', operator: 'equals', value: '' }];
        }
        return out;
      });
      emitUpdate({ ...props.modelValue, groups: updated });
    };

    const addCondition = (groupId) => {
      const updated = groups.value.map(g => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          conditions: [...(g.conditions || []), { id: uid(), field: '', operator: 'equals', value: '' }],
        };
      });
      emitUpdate({ ...props.modelValue, groups: updated });
    };

    const removeCondition = (groupId, condId) => {
      const updated = groups.value.map(g => {
        if (g.id !== groupId) return g;
        return { ...g, conditions: (g.conditions || []).filter(c => c.id !== condId) };
      });
      emitUpdate({ ...props.modelValue, groups: updated });
    };

    const updateCondition = (groupId, condId, field, value) => {
      const updated = groups.value.map(g => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          conditions: (g.conditions || []).map(c => {
            if (c.id !== condId) return c;
            const out = { ...c, [field]: value };
            if (field === 'field') { out.operator = 'equals'; out.value = ''; }
            return out;
          }),
        };
      });
      emitUpdate({ ...props.modelValue, groups: updated });
    };

    return {
      groups, matchMode, collectionOptions,
      getFieldOptions, getOperatorOptions, isValueRequired,
      updateMatchMode, addGroup, removeGroup, updateGroup,
      addCondition, removeCondition, updateCondition,
    };
  },
};
</script>

<style lang="scss" scoped>
@import 'polaris-weweb-styles';

.condition-builder {
  display: flex;
  flex-direction: column;
  gap: var(--p-space-300);
}

.condition-groups {
  display: flex;
  flex-direction: column;
  gap: var(--p-space-300);
}

.condition-list {
  display: flex;
  flex-direction: column;
  gap: var(--p-space-200);
  margin-top: var(--p-space-200);
}

.condition-row {
  display: flex;
  flex-direction: column;
  gap: var(--p-space-100);
}

.condition-operator-label {
  padding-left: var(--p-space-100);
}

.condition-fields {
  display: flex;
  align-items: flex-end;
  gap: var(--p-space-200);
}
</style>
