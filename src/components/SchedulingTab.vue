<template>
  <div class="scheduling-tab">
    <PolarisBlockStack gap="600">
      <!-- Cooldown -->
      <PolarisConfigSection icon="⏱️" title="Cooldown" subtitle="Minimum gap between any action for the same user">
        <PolarisTextField
          label="Cooldown Hours"
          type="number"
          :modelValue="config?.cooldown_hours ?? ''"
          @update:modelValue="update('cooldown_hours', $event ? parseInt($event) : null)"
          placeholder="e.g. 24"
          helpText="Leave empty for no cooldown"
          :min="0"
        />
      </PolarisConfigSection>

      <!-- Quiet Hours -->
      <PolarisConfigSection icon="🌙" title="Quiet Hours" subtitle="Suppress actions during off-hours">
        <PolarisBlockStack gap="300">
          <PolarisCheckbox
            :modelValue="quietHours?.enabled || false"
            @update:modelValue="updateQuietHours('enabled', $event)"
            label="Enable quiet hours"
          />

          <template v-if="quietHours?.enabled">
            <PolarisInline gap="300">
              <div style="flex: 1;">
                <PolarisTextField
                  label="Start time"
                  type="time"
                  :modelValue="quietHours?.start || '22:00'"
                  @update:modelValue="updateQuietHours('start', $event)"
                />
              </div>
              <div style="flex: 1;">
                <PolarisTextField
                  label="End time"
                  type="time"
                  :modelValue="quietHours?.end || '08:00'"
                  @update:modelValue="updateQuietHours('end', $event)"
                />
              </div>
            </PolarisInline>

            <PolarisSelect
              label="Timezone"
              :modelValue="quietHours?.timezone || 'Asia/Bangkok'"
              @update:modelValue="updateQuietHours('timezone', $event)"
              :options="timezoneOptions"
            />
          </template>
        </PolarisBlockStack>
      </PolarisConfigSection>

      <!-- Blackout Dates -->
      <PolarisConfigSection icon="📅" title="Blackout Dates" subtitle="Days when the agent will not execute any actions">
        <PolarisBlockStack gap="200">
          <div v-for="(date, idx) in blackoutDates" :key="idx" class="blackout-row">
            <PolarisTextField
              labelHidden
              label="Date"
              type="date"
              :modelValue="date"
              @update:modelValue="updateBlackoutDate(idx, $event)"
            />
            <PolarisButton variant="plain" icon="close" iconOnly @click="removeBlackoutDate(idx)" />
          </div>
          <PolarisButton variant="outline" fullWidth @click="addBlackoutDate">+ Add Date</PolarisButton>
        </PolarisBlockStack>
      </PolarisConfigSection>

      <!-- Constraints -->
      <PolarisConfigSection icon="🛡️" title="Agent-Level Guardrails" subtitle="Limits that apply across ALL actions in this agent">
        <PolarisBlockStack gap="200">
          <div v-for="(rule, idx) in constraints" :key="idx" class="constraint-row">
            <span class="constraint-row__text">No more than</span>
            <div class="constraint-row__field" style="width: 70px;">
              <PolarisTextField
                labelHidden label="Limit"
                type="number" :min="1"
                :modelValue="rule?.limit ?? 1"
                @update:modelValue="updateConstraint(idx, 'limit', parseInt($event) || 1)"
              />
            </div>
            <div class="constraint-row__field" style="width: 120px;">
              <PolarisSelect
                labelHidden label="Metric"
                :modelValue="rule?.metric || 'actions'"
                @update:modelValue="updateConstraint(idx, 'metric', $event)"
                :options="metricOptions"
              />
            </div>
            <div class="constraint-row__field" style="width: 110px;">
              <PolarisSelect
                labelHidden label="Scope"
                :modelValue="rule?.scope || 'per_user'"
                @update:modelValue="updateConstraint(idx, 'scope', $event)"
                :options="scopeOptions"
              />
            </div>
            <div class="constraint-row__field" style="width: 110px;">
              <PolarisSelect
                labelHidden label="Window"
                :modelValue="rule?.window || 'per_day'"
                @update:modelValue="updateConstraint(idx, 'window', $event)"
                :options="windowOptions"
              />
            </div>
            <PolarisButton variant="plain" icon="close" iconOnly @click="removeConstraint(idx)" />
          </div>

          <PolarisButton variant="outline" fullWidth @click="addConstraint">+ Add Constraint</PolarisButton>
        </PolarisBlockStack>
      </PolarisConfigSection>
    </PolarisBlockStack>
  </div>
</template>

<script>
import { computed } from 'vue';
import {
  PolarisTextField, PolarisSelect, PolarisButton, PolarisCheckbox,
  PolarisBlockStack, PolarisInline, PolarisConfigSection,
} from 'polaris-weweb-styles/components';

export default {
  name: 'SchedulingTab',
  components: {
    PolarisTextField, PolarisSelect, PolarisButton, PolarisCheckbox,
    PolarisBlockStack, PolarisInline, PolarisConfigSection,
  },
  props: {
    config: { type: Object, default: () => ({}) },
  },
  emits: ['update'],
  setup(props, { emit }) {
    const quietHours = computed(() => props.config?.quiet_hours || { enabled: false, start: '22:00', end: '08:00', timezone: 'Asia/Bangkok' });
    const blackoutDates = computed(() => props.config?.blackout_dates || []);
    const constraints = computed(() => props.config?.constraints || []);

    const timezoneOptions = [
      { value: 'Asia/Bangkok', label: 'Asia/Bangkok (UTC+7)' },
      { value: 'Asia/Singapore', label: 'Asia/Singapore (UTC+8)' },
      { value: 'Asia/Tokyo', label: 'Asia/Tokyo (UTC+9)' },
      { value: 'Asia/Shanghai', label: 'Asia/Shanghai (UTC+8)' },
      { value: 'Asia/Kolkata', label: 'Asia/Kolkata (UTC+5:30)' },
      { value: 'Europe/London', label: 'Europe/London (UTC+0)' },
      { value: 'America/New_York', label: 'America/New_York (UTC-5)' },
      { value: 'America/Los_Angeles', label: 'America/Los_Angeles (UTC-8)' },
    ];

    const metricOptions = [
      { value: 'actions', label: 'actions' },
      { value: 'points', label: 'points' },
      { value: 'tickets', label: 'tickets' },
      { value: 'messages', label: 'messages' },
      { value: 'cost', label: 'cost units' },
    ];

    const scopeOptions = [
      { value: 'per_user', label: 'per user' },
      { value: 'per_workflow', label: 'total' },
    ];

    const windowOptions = [
      { value: 'per_execution', label: 'per execution' },
      { value: 'per_day', label: 'per day' },
      { value: 'per_week', label: 'per week' },
      { value: 'per_month', label: 'per month' },
    ];

    const emitConfig = (patch) => emit('update', { ...props.config, ...patch });

    const update = (field, value) => emitConfig({ [field]: value });

    const updateQuietHours = (field, value) => {
      emitConfig({ quiet_hours: { ...quietHours.value, [field]: value } });
    };

    const addBlackoutDate = () => {
      emitConfig({ blackout_dates: [...blackoutDates.value, ''] });
    };

    const updateBlackoutDate = (idx, value) => {
      const dates = [...blackoutDates.value];
      dates[idx] = value;
      emitConfig({ blackout_dates: dates });
    };

    const removeBlackoutDate = (idx) => {
      emitConfig({ blackout_dates: blackoutDates.value.filter((_, i) => i !== idx) });
    };

    const addConstraint = () => {
      emitConfig({
        constraints: [...constraints.value, { metric: 'actions', limit: 3, scope: 'per_user', window: 'per_week' }],
      });
    };

    const updateConstraint = (idx, field, value) => {
      const list = constraints.value.map((r, i) => (i === idx ? { ...r, [field]: value } : r));
      emitConfig({ constraints: list });
    };

    const removeConstraint = (idx) => {
      emitConfig({ constraints: constraints.value.filter((_, i) => i !== idx) });
    };

    return {
      quietHours, blackoutDates, constraints,
      timezoneOptions, metricOptions, scopeOptions, windowOptions,
      update, updateQuietHours,
      addBlackoutDate, updateBlackoutDate, removeBlackoutDate,
      addConstraint, updateConstraint, removeConstraint,
    };
  },
};
</script>

<style lang="scss" scoped>
@import 'polaris-weweb-styles';

.scheduling-tab {
  padding: 0;
}

.blackout-row {
  display: flex;
  align-items: flex-end;
  gap: var(--p-space-200);
}

.constraint-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: var(--p-space-200) var(--p-space-300);
  background: var(--p-color-bg-surface-secondary);
  border: var(--p-border-width-025) solid var(--p-color-border);
  border-radius: var(--p-border-radius-200);

  &__text {
    font-size: var(--p-font-size-300);
    color: var(--p-color-text-secondary);
    white-space: nowrap;
  }

  &__field {
    flex-shrink: 0;
  }
}
</style>
