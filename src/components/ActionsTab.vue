<template>
  <div class="actions-tab">
    <!-- Action Editor Panel (slide-out) -->
    <div v-if="editingAction !== null" class="action-editor-panel">
      <div class="action-editor-panel__header">
        <PolarisInline gap="200" blockAlign="center" align="space-between">
          <PolarisInline gap="200" blockAlign="center">
            <PolarisButton variant="plain" icon="arrowLeft" iconOnly @click="cancelEdit" />
            <PolarisText variant="headingMd">{{ editingAction?.id ? 'Edit Action' : 'New Action' }}</PolarisText>
          </PolarisInline>
          <PolarisInline gap="200">
            <PolarisButton @click="cancelEdit">Cancel</PolarisButton>
            <PolarisButton variant="primary" @click="saveAction">Save Action</PolarisButton>
          </PolarisInline>
        </PolarisInline>
      </div>

      <div class="action-editor-panel__body">
        <ActionEditor
          :action="editingAction"
          :actionTypeConfigs="actionTypeConfigs"
          :actionOptions="actionOptions"
          :audiences="audiences"
          :collections="collections"
          @update="editingAction = $event"
        />
      </div>
    </div>

    <!-- Actions list -->
    <template v-else>
      <PolarisInline gap="200" blockAlign="center" align="space-between">
        <PolarisText variant="headingMd">Actions ({{ actions?.length || 0 }})</PolarisText>
        <PolarisButton variant="primary" icon="plus" @click="addAction">Add Action</PolarisButton>
      </PolarisInline>

      <PolarisEmptyState v-if="!actions?.length" icon="⚡" heading="No actions yet" compact>
        Add actions that the AI agent can choose from when engaging with users.
        <template #actions>
          <PolarisButton variant="primary" @click="addAction">Add Action</PolarisButton>
        </template>
      </PolarisEmptyState>

      <div v-else class="actions-list">
        <div
          v-for="(action, idx) in actions"
          :key="action?.id || idx"
          class="action-item"
        >
          <div class="action-item__toggle">
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="action?.is_enabled !== false"
                @change="toggleAction(idx, $event.target.checked)"
              />
              <span class="toggle-switch__slider"></span>
            </label>
          </div>

          <div class="action-item__info" @click="editAction(idx)">
            <span class="action-item__name">{{ action?.name || 'Untitled Action' }}</span>
            <span class="action-item__type">{{ formatActionType(action?.action_type) }}</span>
          </div>

          <div class="action-item__actions">
            <PolarisButton variant="plain" size="slim" @click="editAction(idx)">Edit</PolarisButton>
            <PolarisButton variant="plain" icon="delete" iconOnly @click="removeAction(idx)" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref } from 'vue';
import {
  PolarisButton, PolarisText, PolarisInline, PolarisEmptyState,
} from 'polaris-weweb-styles/components';
import ActionEditor from './ActionEditor.vue';

const uid = () => crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default {
  name: 'ActionsTab',
  components: { PolarisButton, PolarisText, PolarisInline, PolarisEmptyState, ActionEditor },
  props: {
    actions: { type: Array, default: () => [] },
    actionTypeConfigs: { type: Array, default: () => [] },
    actionOptions: { type: Object, default: () => ({}) },
    audiences: { type: Array, default: () => [] },
    collections: { type: Array, default: () => [] },
  },
  emits: ['update'],
  setup(props, { emit }) {
    const editingAction = ref(null);
    const editingIndex = ref(-1);

    const formatActionType = (type) =>
      (type || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const addAction = () => {
      editingAction.value = {
        _tempId: uid(),
        action_type: '',
        name: '',
        is_enabled: true,
        variable_config: {},
        guardrail_config: {},
        eligibility_conditions: { match: 'all', groups: [] },
        sort_order: (props.actions?.length || 0) + 1,
      };
      editingIndex.value = -1;
    };

    const editAction = (idx) => {
      editingAction.value = JSON.parse(JSON.stringify(props.actions[idx]));
      editingIndex.value = idx;
    };

    const cancelEdit = () => {
      editingAction.value = null;
      editingIndex.value = -1;
    };

    const saveAction = () => {
      if (!editingAction.value) return;
      const list = [...(props.actions || [])];
      const actionData = { ...editingAction.value };
      delete actionData._tempId;

      if (editingIndex.value >= 0) {
        list[editingIndex.value] = actionData;
      } else {
        list.push(actionData);
      }

      emit('update', list);
      editingAction.value = null;
      editingIndex.value = -1;
    };

    const removeAction = (idx) => {
      const list = [...(props.actions || [])];
      list.splice(idx, 1);
      emit('update', list);
    };

    const toggleAction = (idx, enabled) => {
      const list = (props.actions || []).map((a, i) =>
        i === idx ? { ...a, is_enabled: enabled } : a
      );
      emit('update', list);
    };

    return {
      editingAction, editingIndex, formatActionType,
      addAction, editAction, cancelEdit, saveAction, removeAction, toggleAction,
    };
  },
};
</script>

<style lang="scss" scoped>
@import 'polaris-weweb-styles';

.actions-tab {
  display: flex;
  flex-direction: column;
  gap: var(--p-space-400);

  input[type="radio"],
  input[type="checkbox"] {
    accent-color: var(--p-color-bg-fill-brand, #2C6ECB);
  }
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: var(--p-space-200);
}

.action-item {
  display: flex;
  align-items: center;
  gap: var(--p-space-300);
  padding: var(--p-space-300) var(--p-space-400);
  background: var(--p-color-bg-surface);
  border: var(--p-border-width-025) solid var(--p-color-border);
  border-radius: var(--p-border-radius-200);
  transition: border-color var(--p-motion-duration-150) var(--p-motion-ease);

  &:hover {
    border-color: var(--p-color-border-hover);
  }

  &__toggle {
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    cursor: pointer;
    min-width: 0;
  }

  &__name {
    font-size: var(--p-font-size-325);
    font-weight: var(--p-font-weight-semibold);
    color: var(--p-color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__type {
    font-size: var(--p-font-size-275);
    color: var(--p-color-text-secondary);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: var(--p-space-100);
    flex-shrink: 0;
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

.action-editor-panel {
  display: flex;
  flex-direction: column;
  gap: var(--p-space-400);
  margin: calc(-1 * var(--p-space-600));
  min-height: 100%;

  &__header {
    padding: var(--p-space-300) var(--p-space-600);
    border-bottom: 1px solid var(--p-color-border);
    box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.04);
    background: var(--p-color-bg-surface);
    position: sticky;
    top: 0;
    z-index: 5;
  }

  &__body {
    padding: 0 var(--p-space-600) var(--p-space-600);
  }
}
</style>
