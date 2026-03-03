<template>
  <div class="action-editor">
    <PolarisBlockStack gap="400">
      <!-- Section: Action Configuration -->
      <PolarisCard>
        <PolarisCardHeader title="Action Configuration" description="Define the action type and its parameters" />
        <PolarisCardSection>
        <PolarisBlockStack gap="400">
          <PolarisTextField
            label="Action Name"
            required
            :modelValue="action?.name || ''"
            @update:modelValue="update('name', $event)"
            placeholder="e.g. Send Welcome LINE"
          />

          <PolarisSelect
            label="Action Type"
            required
            :modelValue="action?.action_type || ''"
            @update:modelValue="handleActionTypeChange($event)"
            :options="actionTypeOptions"
            placeholder="Select action type..."
          />

          <!-- Dynamic variable fields from action type config -->
          <template v-if="action?.action_type && currentVariables?.length">
            <div v-for="variable in currentVariables" :key="variable.name" class="variable-field">
              <!-- Number: show min/max range for agent -->
              <template v-if="variable.data_type === 'number'">
                <PolarisText variant="bodySm" color="subdued">{{ variable.label || variable.name }}</PolarisText>
                <PolarisInline gap="200">
                  <div style="flex: 1;">
                    <PolarisTextField
                      label="Min"
                      type="number"
                      :modelValue="getVariableValue(variable.name, 'min') ?? variable.default ?? ''"
                      @update:modelValue="setVariableValue(variable.name, 'min', $event)"
                    />
                  </div>
                  <div style="flex: 1;">
                    <PolarisTextField
                      label="Max"
                      type="number"
                      :modelValue="getVariableValue(variable.name, 'max') ?? ''"
                      @update:modelValue="setVariableValue(variable.name, 'max', $event)"
                    />
                  </div>
                </PolarisInline>
              </template>

              <!-- Text: tag-style multi-value input -->
              <template v-else-if="variable.data_type === 'text'">
                <div class="tag-input-field">
                  <label class="tag-input-field__label">
                    {{ variable.label || variable.name }}
                    <span v-if="variable.required" class="tag-input-field__required">*</span>
                  </label>
                  <div class="tag-input-wrapper">
                    <span
                      v-for="(val, vIdx) in getTextValues(variable.name)"
                      :key="vIdx"
                      class="tag-chip"
                    >
                      {{ val }}
                      <button class="tag-chip__remove" @click="removeTextValue(variable.name, vIdx)" type="button">&times;</button>
                    </span>
                    <input
                      class="tag-input-wrapper__input"
                      placeholder="Type and press Enter..."
                      @keydown.enter.prevent="addTextValue(variable.name, $event)"
                    />
                  </div>
                  <span class="tag-input-field__help">Possible values the AI can pick from</span>
                </div>
              </template>

              <!-- Select: dropdown with options from config -->
              <template v-else-if="variable.data_type === 'select'">
                <PolarisSelect
                  :label="variable.label || variable.name"
                  :required="variable.required"
                  :modelValue="getVariableValue(variable.name) ?? variable.default ?? ''"
                  @update:modelValue="setVariableValue(variable.name, null, $event)"
                  :options="(variable.options || []).map(o => typeof o === 'string' ? { value: o, label: o } : o)"
                  placeholder="Select..."
                />
              </template>

              <!-- Select Entity: dropdown from entity lookup -->
              <template v-else-if="variable.data_type === 'select_entity'">
                <PolarisSelect
                  :label="variable.label || variable.name"
                  :required="variable.required"
                  :modelValue="getVariableValue(variable.name) ?? ''"
                  @update:modelValue="setVariableValue(variable.name, null, $event)"
                  :options="getEntityOptions(variable.entity_table)"
                  placeholder="Select..."
                />
              </template>

              <!-- JSON: code textarea -->
              <template v-else-if="variable.data_type === 'json'">
                <PolarisTextField
                  :label="variable.label || variable.name"
                  :modelValue="getVariableValue(variable.name) ?? ''"
                  @update:modelValue="setVariableValue(variable.name, null, $event)"
                  multiline
                  monospace
                  :rows="4"
                  placeholder="{}"
                />
              </template>
            </div>
          </template>
        </PolarisBlockStack>
        </PolarisCardSection>
      </PolarisCard>

      <!-- Section: Guardrails (only if action type has them) -->
      <PolarisCard v-if="currentGuardrails?.length">
      <PolarisConfigSection
        icon="🛡️"
        title="Action Guardrails"
        subtitle="Limits specific to this action"
        collapsible
        :defaultOpen="true"
      >
        <PolarisBlockStack gap="400">
          <div v-for="guardrail in currentGuardrails" :key="guardrail.name">
            <!-- Number guardrail -->
            <PolarisTextField
              v-if="guardrail.data_type === 'number'"
              :label="guardrail.label || guardrail.name"
              type="number"
              :modelValue="getGuardrailValue(guardrail.name) ?? ''"
              @update:modelValue="setGuardrailValue(guardrail.name, $event)"
              :min="0"
            />

            <!-- Select guardrail -->
            <PolarisSelect
              v-else-if="guardrail.data_type === 'select'"
              :label="guardrail.label || guardrail.name"
              :modelValue="getGuardrailValue(guardrail.name) ?? ''"
              @update:modelValue="setGuardrailValue(guardrail.name, $event)"
              :options="(guardrail.options || []).map(o => typeof o === 'string' ? { value: o, label: o } : o)"
            />

            <!-- Date guardrail -->
            <PolarisTextField
              v-else-if="guardrail.data_type === 'date'"
              :label="guardrail.label || guardrail.name"
              type="date"
              :modelValue="getGuardrailValue(guardrail.name) ?? ''"
              @update:modelValue="setGuardrailValue(guardrail.name, $event)"
            />

            <!-- Frequency guardrail: number + window combo -->
            <template v-else-if="guardrail.data_type === 'frequency'">
              <PolarisText variant="bodySm" color="subdued">{{ guardrail.label || guardrail.name }}</PolarisText>
              <PolarisInline gap="200">
                <div style="flex: 1;">
                  <PolarisTextField
                    label="Limit" type="number" :min="1"
                    :modelValue="getGuardrailValue(guardrail.name + '_limit') ?? ''"
                    @update:modelValue="setGuardrailValue(guardrail.name + '_limit', $event)"
                  />
                </div>
                <div style="flex: 1;">
                  <PolarisSelect
                    label="Window"
                    :modelValue="getGuardrailValue(guardrail.name + '_window') ?? 'per_day'"
                    @update:modelValue="setGuardrailValue(guardrail.name + '_window', $event)"
                    :options="frequencyWindowOptions"
                  />
                </div>
              </PolarisInline>
            </template>
          </div>
        </PolarisBlockStack>
      </PolarisConfigSection>
      </PolarisCard>

      <!-- Section: Eligibility Conditions -->
      <PolarisCard>
      <PolarisConfigSection
        icon="🎯"
        title="Eligibility"
        subtitle="Optional filter — only apply this action to users who meet these criteria"
        collapsible
        :defaultOpen="hasEligibility"
      >
        <ConditionBuilder
          :modelValue="action?.eligibility_conditions || { match: 'all', groups: [] }"
          @update:modelValue="update('eligibility_conditions', $event)"
          :collections="collections"
        />
      </PolarisConfigSection>
      </PolarisCard>
    </PolarisBlockStack>
  </div>
</template>

<script>
import { computed } from 'vue';
import {
  PolarisTextField, PolarisSelect, PolarisButton,
  PolarisBlockStack, PolarisInline, PolarisText, PolarisConfigSection,
  PolarisCard, PolarisCardHeader, PolarisCardSection,
} from 'polaris-weweb-styles/components';
import ConditionBuilder from './ConditionBuilder.vue';

export default {
  name: 'ActionEditor',
  components: {
    PolarisTextField, PolarisSelect, PolarisButton,
    PolarisBlockStack, PolarisInline, PolarisText, PolarisConfigSection,
    PolarisCard, PolarisCardHeader, PolarisCardSection, ConditionBuilder,
  },
  props: {
    action: { type: Object, default: () => ({}) },
    actionTypeConfigs: { type: Array, default: () => [] },
    actionOptions: { type: Object, default: () => ({}) },
    audiences: { type: Array, default: () => [] },
    collections: { type: Array, default: () => [] },
  },
  emits: ['update'],
  setup(props, { emit }) {
    const frequencyWindowOptions = [
      { value: 'per_day', label: 'per day' },
      { value: 'per_week', label: 'per week' },
      { value: 'per_month', label: 'per month' },
    ];

    const actionTypeOptions = computed(() =>
      (props.actionTypeConfigs || []).map(c => ({
        value: c?.action_type || '',
        label: (c?.action_type || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      }))
    );

    const currentTypeConfig = computed(() =>
      (props.actionTypeConfigs || []).find(c => c?.action_type === props.action?.action_type)
    );

    const currentVariables = computed(() => currentTypeConfig.value?.applicable_variables || []);
    const currentGuardrails = computed(() => currentTypeConfig.value?.applicable_guardrails || []);

    const hasEligibility = computed(() => {
      const ec = props.action?.eligibility_conditions;
      return ec?.groups?.length > 0;
    });

    const update = (field, value) => {
      emit('update', { ...props.action, [field]: value });
    };

    const handleActionTypeChange = (newType) => {
      emit('update', {
        ...props.action,
        action_type: newType,
        variable_config: {},
        action_constraints: {},
      });
    };

    const variableConfig = computed(() => props.action?.variable_config || {});
    const guardrailConfig = computed(() => props.action?.action_constraints || {});

    const getVariableValue = (name, subField = null) => {
      const val = variableConfig.value?.[name];
      if (subField && typeof val === 'object' && val !== null) return val[subField];
      if (subField) return undefined;
      return val;
    };

    const setVariableValue = (name, subField, value) => {
      const config = { ...variableConfig.value };
      if (subField) {
        config[name] = { ...(typeof config[name] === 'object' ? config[name] : {}), [subField]: value };
      } else {
        config[name] = value;
      }
      update('variable_config', config);
    };

    const getTextValues = (name) => {
      const val = variableConfig.value?.[name];
      return Array.isArray(val) ? val : val ? [val] : [];
    };

    const addTextValue = (name, event) => {
      const input = event.target;
      const val = input.value?.trim();
      if (!val) return;
      const current = getTextValues(name);
      if (!current.includes(val)) {
        setVariableValue(name, null, [...current, val]);
      }
      input.value = '';
    };

    const removeTextValue = (name, idx) => {
      const current = getTextValues(name);
      setVariableValue(name, null, current.filter((_, i) => i !== idx));
    };

    const getGuardrailValue = (name) => guardrailConfig.value?.[name];

    const setGuardrailValue = (name, value) => {
      update('action_constraints', { ...guardrailConfig.value, [name]: value });
    };

    const getEntityOptions = (entityTable) => {
      if (!entityTable) return [];
      const opts = props.actionOptions || {};

      if (entityTable === 'tag_master') {
        return (opts.tags || []).map(t => ({
          value: t?.id || '',
          label: t?.tag_name || t?.name || '',
        }));
      }

      if (entityTable === 'persona_master') {
        const groups = opts.persona_groups || [];
        const flat = [];
        groups.forEach(g => {
          (g?.personas || []).forEach(p => {
            flat.push({
              value: p?.id || '',
              label: `${p?.persona_name || ''}${g?.group_name ? ` (${g.group_name})` : ''}`,
            });
          });
        });
        return flat;
      }

      if (entityTable === 'ticket_type') {
        return (opts.ticket_types || []).map(t => ({
          value: t?.id || '',
          label: t?.name || t?.ticket_code || '',
        }));
      }

      if (entityTable === 'form_templates') {
        return (opts.forms || []).map(f => ({
          value: f?.id || '',
          label: f?.name || f?.code || '',
        }));
      }

      if (entityTable === 'earn_factor') {
        return (opts.private_earn_factors || []).map(ef => ({
          value: ef?.id || '',
          label: `${ef?.group_name || ''} — ${ef?.earn_factor_type || ''} (${ef?.earn_factor_amount ?? ''} ${ef?.target_currency || ''})`,
        }));
      }

      if (entityTable === 'amp_audience_master') {
        return (props.audiences || []).map(a => ({
          value: a?.id || '',
          label: a?.name || '',
        }));
      }

      return [];
    };

    return {
      actionTypeOptions, currentVariables, currentGuardrails, hasEligibility,
      frequencyWindowOptions,
      update, handleActionTypeChange,
      getVariableValue, setVariableValue, getTextValues, addTextValue, removeTextValue,
      getGuardrailValue, setGuardrailValue, getEntityOptions,
    };
  },
};
</script>

<style lang="scss" scoped>
@import 'polaris-weweb-styles';

.action-editor {
  padding: 0;
}

.variable-field {
  display: flex;
  flex-direction: column;
  gap: var(--p-space-100);
}

.tag-input-field {
  display: flex;
  flex-direction: column;
  gap: var(--p-space-100);

  &__label {
    @include polaris-label;
  }

  &__required {
    color: var(--p-color-text-critical);
  }

  &__help {
    font-size: var(--p-font-size-275);
    color: var(--p-color-text-secondary);
  }
}

.tag-input-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: var(--p-space-100);
  padding: var(--p-space-100) var(--p-space-200);
  border: var(--p-border-width-025) solid var(--p-color-border);
  border-radius: var(--p-border-radius-200);
  background: var(--p-color-bg-surface);
  min-height: 36px;
  align-items: center;
  cursor: text;
  transition: border-color var(--p-motion-duration-150) var(--p-motion-ease);

  &:focus-within {
    border-color: var(--p-color-border-focus);
    outline: 1px solid var(--p-color-border-focus);
  }

  &__input {
    flex: 1;
    min-width: 100px;
    border: none;
    outline: none;
    background: transparent;
    font-size: var(--p-font-size-325);
    color: var(--p-color-text);
    padding: 2px 0;
    font-family: var(--p-font-family-sans);
  }
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: var(--p-color-bg-fill-info-secondary);
  color: var(--p-color-text-info);
  border-radius: var(--p-border-radius-full);
  font-size: var(--p-font-size-275);
  white-space: nowrap;

  &__remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: inherit;
    padding: 0;
    font-size: 14px;
    line-height: 1;
    border-radius: 50%;

    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
