<template>
  <div class="config-tab">
    <PolarisBlockStack gap="400">
      <PolarisCard>
        <PolarisCardSection>
          <PolarisBlockStack gap="400">
            <PolarisTextField
              label="Name"
              required
              :modelValue="config?.name || ''"
              @update:modelValue="update('name', $event)"
              placeholder="e.g. Win-Back Agent"
            />
            <PolarisTextField
              label="Description"
              :modelValue="config?.description || ''"
              @update:modelValue="update('description', $event)"
              placeholder="Describe what this agent does..."
              multiline
              :rows="3"
            />
          </PolarisBlockStack>
        </PolarisCardSection>
      </PolarisCard>

      <PolarisCard>
        <PolarisCardSection>
          <PolarisBlockStack gap="400">
            <PolarisSelect
              label="Objective"
              required
              :modelValue="config?.objective || ''"
              @update:modelValue="update('objective', $event)"
              :options="objectiveOptions"
              placeholder="Select objective..."
              helpText="The primary goal this agent optimizes for"
            />
            <PolarisSelect
              label="Tone"
              :modelValue="config?.tone || ''"
              @update:modelValue="update('tone', $event)"
              :options="toneOptions"
              placeholder="Select tone..."
              helpText="Communication style the AI uses when crafting messages"
            />
          </PolarisBlockStack>
        </PolarisCardSection>
      </PolarisCard>

      <PolarisCard>
        <PolarisCardSection>
          <PolarisBlockStack gap="400">
            <PolarisTextField
              label="Context Hint"
              :modelValue="config?.context_hint || ''"
              @update:modelValue="update('context_hint', $event)"
              placeholder="e.g. These are lapsed VIP customers who haven't purchased in 90 days"
              multiline
              :rows="3"
              helpText="Give the AI extra context about the audience or campaign to improve its decisions"
            />
            <PolarisTextField
              label="Max Actions Per Execution"
              type="number"
              :modelValue="config?.max_actions_per_execution ?? 3"
              @update:modelValue="update('max_actions_per_execution', parseInt($event) || 1)"
              helpText="Maximum number of actions the agent can take per user per execution cycle"
              :min="1"
              :max="20"
            />
          </PolarisBlockStack>
        </PolarisCardSection>
      </PolarisCard>

      <!-- Deliberation Settings -->
      <PolarisCard>
        <PolarisConfigSection
          icon="🔄"
          title="Deliberation Settings"
          subtitle="Control how many observe-wait cycles the agent can perform"
          collapsible
          :defaultOpen="false"
        >
          <PolarisBlockStack gap="400">
            <PolarisTextField
              label="Max Cycles"
              type="number"
              :modelValue="config?.max_deliberation_cycles ?? 3"
              @update:modelValue="update('max_deliberation_cycles', parseInt($event) || 1)"
              helpText="Agent will observe and wait up to this many times before stopping"
              :min="1"
              :max="10"
            />
            <PolarisTextField
              label="Default Wait"
              :modelValue="config?.default_wait_duration || '2d'"
              @update:modelValue="update('default_wait_duration', $event)"
              helpText="How long to wait between cycles if AI doesn't specify (e.g. 2d, 12h)"
              placeholder="e.g. 2d, 12h"
            />
            <PolarisTextField
              label="Max Wait"
              :modelValue="config?.max_wait_duration || '7d'"
              @update:modelValue="update('max_wait_duration', $event)"
              helpText="Cap on any single wait the AI can request"
              placeholder="e.g. 7d"
            />
            <PolarisTextField
              label="Total Timeout"
              :modelValue="config?.deliberation_timeout || '14d'"
              @update:modelValue="update('deliberation_timeout', $event)"
              helpText="Maximum total time from first cycle to final decision"
              placeholder="e.g. 14d"
            />
          </PolarisBlockStack>
        </PolarisConfigSection>
      </PolarisCard>
    </PolarisBlockStack>
  </div>
</template>

<script>
import {
  PolarisTextField, PolarisSelect, PolarisBlockStack,
  PolarisCard, PolarisCardSection, PolarisConfigSection,
} from 'polaris-weweb-styles/components';

export default {
  name: 'ConfigTab',
  components: {
    PolarisTextField, PolarisSelect, PolarisBlockStack,
    PolarisCard, PolarisCardSection, PolarisConfigSection,
  },
  props: {
    config: { type: Object, default: () => ({}) },
  },
  emits: ['update'],
  setup(props, { emit }) {
    const objectiveOptions = [
      { value: 're_engage', label: 'Re-engage' },
      { value: 'drive_purchase', label: 'Drive Purchase' },
      { value: 'redeem_points', label: 'Redeem Points' },
      { value: 'tier_upgrade', label: 'Tier Upgrade' },
      { value: 'win_back', label: 'Win Back' },
      { value: 'upsell', label: 'Upsell' },
    ];

    const toneOptions = [
      { value: 'urgent', label: 'Urgent' },
      { value: 'friendly', label: 'Friendly' },
      { value: 'exclusive', label: 'Exclusive' },
      { value: 'celebratory', label: 'Celebratory' },
    ];

    const update = (field, value) => {
      emit('update', { ...props.config, [field]: value });
    };

    return { objectiveOptions, toneOptions, update };
  },
};
</script>

<style lang="scss" scoped>
.config-tab {
  padding: 0;
}
</style>
