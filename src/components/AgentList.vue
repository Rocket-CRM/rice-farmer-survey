<template>
  <div class="agent-list">
    <!-- Header -->
    <PolarisInline gap="200" blockAlign="center" align="space-between">
      <PolarisText variant="headingLg">AI Agents</PolarisText>
      <PolarisButton variant="primary" icon="plus" @click="$emit('create')">New Agent</PolarisButton>
    </PolarisInline>

    <!-- Loading -->
    <div v-if="loading" class="agent-list__loading">
      <span class="spinner"></span>
      <PolarisText variant="bodyMd" color="subdued">Loading agents...</PolarisText>
    </div>

    <!-- Empty -->
    <PolarisEmptyState v-else-if="!agents?.length" icon="🤖" heading="No agents yet">
      Create your first AI agent to start automating marketing decisions.
      <template #actions>
        <PolarisButton variant="primary" @click="$emit('create')">Create Agent</PolarisButton>
      </template>
    </PolarisEmptyState>

    <!-- Table -->
    <div v-else class="agent-table-wrapper">
      <table class="agent-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Objective</th>
            <th class="agent-table__center">Actions</th>
            <th class="agent-table__center">Outcomes</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="agent in agents"
            :key="agent?.id"
            class="agent-table__row"
            @click="$emit('select', agent)"
          >
            <td class="agent-table__name">{{ agent?.name || 'Untitled' }}</td>
            <td>
              <PolarisBadge v-if="agent?.objective" variant="info">
                {{ formatObjective(agent.objective) }}
              </PolarisBadge>
              <span v-else class="agent-table__muted">—</span>
            </td>
            <td class="agent-table__center">{{ agent?.action_count ?? 0 }}</td>
            <td class="agent-table__center">{{ agent?.outcome_count ?? 0 }}</td>
            <td>
              <label class="toggle-switch" @click.stop>
                <input
                  type="checkbox"
                  :checked="agent?.is_active === true"
                  @change="$emit('toggle-status', agent, $event.target.checked)"
                />
                <span class="toggle-switch__slider"></span>
              </label>
            </td>
            <td class="agent-table__date">{{ formatDate(agent?.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import {
  PolarisButton, PolarisText, PolarisInline, PolarisEmptyState, PolarisBadge,
} from 'polaris-weweb-styles/components';

export default {
  name: 'AgentList',
  components: { PolarisButton, PolarisText, PolarisInline, PolarisEmptyState, PolarisBadge },
  props: {
    agents: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  emits: ['create', 'select', 'toggle-status'],
  setup() {
    const formatObjective = (obj) =>
      (obj || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const formatDate = (dateStr) => {
      if (!dateStr) return '—';
      try {
        return new Date(dateStr).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        });
      } catch { return '—'; }
    };

    return { formatObjective, formatDate };
  },
};
</script>

<style lang="scss" scoped>
@import 'polaris-weweb-styles';

.agent-list {
  display: flex;
  flex-direction: column;
  gap: var(--p-space-400);
}

.agent-list__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--p-space-300);
  padding: var(--p-space-800) 0;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--p-color-border);
  border-top-color: var(--p-color-text);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.agent-table-wrapper {
  overflow-x: auto;
  border: var(--p-border-width-025) solid var(--p-color-border);
  border-radius: var(--p-border-radius-200);
  background: var(--p-color-bg-surface);
}

.agent-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--p-font-size-325);

  th {
    text-align: left;
    padding: var(--p-space-300) var(--p-space-400);
    font-weight: var(--p-font-weight-semibold);
    font-size: var(--p-font-size-275);
    color: var(--p-color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: var(--p-border-width-025) solid var(--p-color-border);
    background: var(--p-color-bg-surface-secondary);
    white-space: nowrap;
  }

  td {
    padding: var(--p-space-300) var(--p-space-400);
    border-bottom: var(--p-border-width-025) solid var(--p-color-border);
    color: var(--p-color-text);
    vertical-align: middle;
  }

  &__center {
    text-align: center !important;
  }

  &__row {
    cursor: pointer;
    transition: background var(--p-motion-duration-150) var(--p-motion-ease);

    &:hover {
      background: var(--p-color-bg-surface-hover);
    }

    &:last-child td {
      border-bottom: none;
    }
  }

  &__name {
    font-weight: var(--p-font-weight-semibold);
    color: var(--p-color-text);
  }

  &__date {
    font-size: var(--p-font-size-275);
    color: var(--p-color-text-secondary);
    white-space: nowrap;
  }

  &__muted {
    color: var(--p-color-text-secondary);
  }
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  cursor: pointer;

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
