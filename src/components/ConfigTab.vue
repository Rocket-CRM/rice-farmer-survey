<template>
  <div class="config-tab">
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
  </div>
</template>

<script>
import {
  PolarisTextField, PolarisSelect, PolarisBlockStack,
} from 'polaris-weweb-styles/components';

export default {
  name: 'ConfigTab',
  components: { PolarisTextField, PolarisSelect, PolarisBlockStack },
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
