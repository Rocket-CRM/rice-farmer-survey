<template>
  <div class="agent-builder" :style="rootStyle">
    <!-- ═══ LIST VIEW ═══ -->
    <div v-if="currentView === 'list'" class="list-view">
      <AgentList
        :agents="agents"
        :loading="isLoading"
        @create="createAgent"
        @select="openAgent"
        @toggle-status="handleToggleStatus"
      />
    </div>

    <!-- ═══ DETAIL / EDITOR VIEW ═══ -->
    <div v-else class="editor-view">
      <!-- Editor Header -->
      <div class="editor-header">
        <PolarisInline gap="300" blockAlign="center">
          <PolarisButton variant="plain" icon="arrowLeft" @click="goBack">Back</PolarisButton>
          <PolarisText variant="headingLg">{{ form?.name || 'New Agent' }}</PolarisText>
          <PolarisBadge v-if="isDirtyState" variant="attention">Unsaved</PolarisBadge>
        </PolarisInline>
        <PolarisInline gap="200">
          <PolarisButton @click="goBack">Cancel</PolarisButton>
          <PolarisButton variant="primary" :loading="isSaving" @click="saveAgent">Save</PolarisButton>
        </PolarisInline>
      </div>

      <!-- Tabs -->
      <div class="editor-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="editor-tab"
          :class="{ 'editor-tab--active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span class="editor-tab__icon">{{ tab.icon }}</span>
          <span class="editor-tab__label">{{ tab.label }}</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="editor-content">
        <PolarisBanner
          v-if="saveError"
          variant="critical"
          title="Save failed"
          dismissible
          @dismiss="saveError = ''"
        >{{ saveError }}</PolarisBanner>

        <ConfigTab
          v-if="activeTab === 'config'"
          :config="form"
          @update="handleFormUpdate"
        />

        <ActionsTab
          v-if="activeTab === 'actions'"
          :actions="agentActions"
          :actionTypeConfigs="actionTypeConfigs"
          :actionOptions="actionOptionsData"
          :collections="collectionsData"
          @update="handleActionsUpdate"
        />

        <OutcomesTab
          v-if="activeTab === 'outcomes'"
          :outcomes="agentOutcomes"
          :collections="collectionsData"
          @update="handleOutcomesUpdate"
        />

        <SchedulingTab
          v-if="activeTab === 'scheduling'"
          :config="form"
          @update="handleFormUpdate"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import {
  PolarisButton, PolarisText, PolarisInline, PolarisBadge, PolarisBanner,
} from 'polaris-weweb-styles/components';
import AgentList from './components/AgentList.vue';
import ConfigTab from './components/ConfigTab.vue';
import ActionsTab from './components/ActionsTab.vue';
import OutcomesTab from './components/OutcomesTab.vue';
import SchedulingTab from './components/SchedulingTab.vue';

const EMPTY_FORM = {
  name: '',
  description: '',
  objective: '',
  tone: '',
  context_hint: '',
  max_actions_per_execution: 3,
  cooldown_hours: null,
  quiet_hours: { enabled: false, start: '22:00', end: '08:00', timezone: 'Asia/Bangkok' },
  blackout_dates: [],
  constraints: [],
  is_active: false,
};

export default {
  name: 'AgentBuilder',
  components: {
    PolarisButton, PolarisText, PolarisInline, PolarisBadge, PolarisBanner,
    AgentList, ConfigTab, ActionsTab, OutcomesTab, SchedulingTab,
  },
  props: {
    uid: { type: String, required: true },
    content: { type: Object, required: true },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
  },
  emits: ['trigger-event'],
  setup(props, { emit, expose }) {
    // ─── View State ──────────────────────────────────
    const currentView = ref('list');
    const activeTab = ref('config');
    const isLoading = ref(false);
    const isSaving = ref(false);
    const saveError = ref('');

    const tabs = [
      { id: 'config', label: 'Configuration', icon: '⚙️' },
      { id: 'actions', label: 'Actions', icon: '⚡' },
      { id: 'outcomes', label: 'Outcomes', icon: '📊' },
      { id: 'scheduling', label: 'Scheduling & Guardrails', icon: '🛡️' },
    ];

    // ─── Data ────────────────────────────────────────
    const agents = ref([]);
    const selectedAgentId = ref(null);
    const form = ref({ ...EMPTY_FORM });
    const agentActions = ref([]);
    const agentOutcomes = ref([]);
    const isDirtyState = ref(false);

    const actionTypeConfigs = ref([]);
    const actionOptionsData = ref({});
    const collectionsData = ref([]);

    // ─── Supabase Helpers ────────────────────────────
    const supabaseUrl = computed(() => props.content?.supabaseUrl?.replace(/\/+$/, '') || '');
    const supabaseAnonKey = computed(() => props.content?.supabaseAnonKey || '');
    const authToken = computed(() => props.content?.authToken || '');

    const headers = computed(() => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken.value}`,
      'apikey': supabaseAnonKey.value || authToken.value,
    }));

    const rpc = async (functionName, body = {}) => {
      if (!supabaseUrl.value || !authToken.value) return null;
      try {
        const res = await fetch(`${supabaseUrl.value}/rest/v1/rpc/${functionName}`, {
          method: 'POST',
          headers: headers.value,
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`RPC ${functionName} failed: ${res.status}`);
        return res.json();
      } catch (err) {
        console.error(`[AgentBuilder] RPC ${functionName} error:`, err);
        return null;
      }
    };

    const query = async (table, select = '*', queryParams = '') => {
      if (!supabaseUrl.value || !authToken.value) return [];
      try {
        const url = `${supabaseUrl.value}/rest/v1/${table}?select=${encodeURIComponent(select)}${queryParams ? '&' + queryParams : ''}`;
        const res = await fetch(url, { method: 'GET', headers: headers.value });
        if (!res.ok) throw new Error(`Query ${table} failed: ${res.status}`);
        return res.json();
      } catch (err) {
        console.error(`[AgentBuilder] Query ${table} error:`, err);
        return [];
      }
    };

    const upsert = async (table, data) => {
      if (!supabaseUrl.value || !authToken.value) return null;
      try {
        const res = await fetch(`${supabaseUrl.value}/rest/v1/${table}`, {
          method: 'POST',
          headers: {
            ...headers.value,
            'Prefer': 'resolution=merge-duplicates,return=representation',
          },
          body: JSON.stringify(Array.isArray(data) ? data : [data]),
        });
        if (!res.ok) throw new Error(`Upsert ${table} failed: ${res.status}`);
        const result = await res.json();
        return Array.isArray(data) ? result : result?.[0];
      } catch (err) {
        console.error(`[AgentBuilder] Upsert ${table} error:`, err);
        throw err;
      }
    };

    const deleteRows = async (table, column, values) => {
      if (!supabaseUrl.value || !authToken.value || !values?.length) return;
      try {
        const inStr = values.map(v => `"${v}"`).join(',');
        await fetch(`${supabaseUrl.value}/rest/v1/${table}?${column}=in.(${inStr})`, {
          method: 'DELETE',
          headers: headers.value,
        });
      } catch (err) {
        console.error(`[AgentBuilder] Delete ${table} error:`, err);
      }
    };

    // ─── WeWeb Internal Variables ────────────────────
    const { value: currentViewVar, setValue: setCurrentView } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid, name: 'currentView', type: 'string', defaultValue: 'list',
      });

    const { value: selectedAgentVar, setValue: setSelectedAgent } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid, name: 'selectedAgent', type: 'object', defaultValue: {},
      });

    const { value: isDirtyVar, setValue: setIsDirty } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid, name: 'isDirty', type: 'boolean', defaultValue: false,
      });

    const { value: agentCountVar, setValue: setAgentCount } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid, name: 'agentCount', type: 'number', defaultValue: 0,
      });

    const { value: agentsVar, setValue: setAgentsVar } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid, name: 'agents', type: 'array', defaultValue: [],
      });

    // ─── Data Fetching ───────────────────────────────
    const fetchAgents = async () => {
      isLoading.value = true;
      try {
        const data = await query('amp_agent', '*, amp_agent_action(count), amp_agent_outcome(count)', 'order=created_at.desc');
        agents.value = data || [];
        setAgentsVar(agents.value);
        setAgentCount(agents.value.length);
      } finally {
        isLoading.value = false;
      }
    };

    const fetchActionTypeConfigs = async () => {
      const data = await query('amp_action_type_config', '*');
      actionTypeConfigs.value = data || [];
    };

    const fetchActionOptions = async () => {
      const data = await rpc('bff_get_amp_action_options');
      if (data) actionOptionsData.value = data;
    };

    const fetchCollections = async () => {
      const data = await rpc('bff_get_workflow_collections');
      if (Array.isArray(data)) collectionsData.value = data;
    };

    const fetchAgentFull = async (agentId) => {
      const [agentArr, actions, outcomes] = await Promise.all([
        query('amp_agent', '*', `id=eq.${agentId}`),
        query('amp_agent_action', '*', `agent_id=eq.${agentId}&order=sort_order.asc`),
        query('amp_agent_outcome', '*', `agent_id=eq.${agentId}&order=sort_order.asc`),
      ]);

      const agent = agentArr?.[0];
      if (!agent) return null;
      return { agent, actions: actions || [], outcomes: outcomes || [] };
    };

    // ─── Navigation ──────────────────────────────────
    const createAgent = () => {
      selectedAgentId.value = null;
      form.value = { ...EMPTY_FORM };
      agentActions.value = [];
      agentOutcomes.value = [];
      isDirtyState.value = false;
      setIsDirty(false);
      activeTab.value = 'config';
      currentView.value = 'detail';
      setCurrentView('detail');
      setSelectedAgent({});
      emit('trigger-event', { name: 'view-changed', event: { view: 'detail', mode: 'create' } });
    };

    const openAgent = async (agent) => {
      if (!agent?.id) return;
      isLoading.value = true;
      try {
        const full = await fetchAgentFull(agent.id);
        if (!full) return;

        selectedAgentId.value = full.agent.id;
        form.value = {
          name: full.agent.name || '',
          description: full.agent.description || '',
          objective: full.agent.objective || '',
          tone: full.agent.tone || '',
          context_hint: full.agent.context_hint || '',
          max_actions_per_execution: full.agent.max_actions_per_execution ?? 3,
          cooldown_hours: full.agent.cooldown_hours,
          quiet_hours: full.agent.quiet_hours || { enabled: false, start: '22:00', end: '08:00', timezone: 'Asia/Bangkok' },
          blackout_dates: full.agent.blackout_dates || [],
          constraints: full.agent.constraints || [],
          is_active: full.agent.is_active || false,
        };
        agentActions.value = full.actions;
        agentOutcomes.value = full.outcomes;
        isDirtyState.value = false;
        setIsDirty(false);
        activeTab.value = 'config';
        currentView.value = 'detail';
        setCurrentView('detail');
        setSelectedAgent(full.agent);
        emit('trigger-event', { name: 'view-changed', event: { view: 'detail', mode: 'edit', agentId: agent.id } });
      } finally {
        isLoading.value = false;
      }
    };

    const goBack = () => {
      currentView.value = 'list';
      setCurrentView('list');
      selectedAgentId.value = null;
      setSelectedAgent({});
      emit('trigger-event', { name: 'view-changed', event: { view: 'list' } });
      fetchAgents();
    };

    // ─── Form Handling ───────────────────────────────
    const handleFormUpdate = (newForm) => {
      form.value = newForm;
      isDirtyState.value = true;
      setIsDirty(true);
    };

    const handleActionsUpdate = (newActions) => {
      agentActions.value = newActions;
      isDirtyState.value = true;
      setIsDirty(true);
    };

    const handleOutcomesUpdate = (newOutcomes) => {
      agentOutcomes.value = newOutcomes;
      isDirtyState.value = true;
      setIsDirty(true);
    };

    // ─── Save ────────────────────────────────────────
    const saveAgent = async () => {
      saveError.value = '';
      if (!form.value?.name?.trim()) {
        saveError.value = 'Agent name is required';
        activeTab.value = 'config';
        return;
      }

      isSaving.value = true;
      try {
        const agentPayload = {
          ...(selectedAgentId.value ? { id: selectedAgentId.value } : {}),
          name: form.value.name,
          description: form.value.description || null,
          objective: form.value.objective || null,
          tone: form.value.tone || null,
          context_hint: form.value.context_hint || null,
          max_actions_per_execution: form.value.max_actions_per_execution || 3,
          cooldown_hours: form.value.cooldown_hours || null,
          quiet_hours: form.value.quiet_hours || null,
          blackout_dates: form.value.blackout_dates?.length ? form.value.blackout_dates : null,
          constraints: form.value.constraints?.length ? form.value.constraints : null,
        };

        const savedAgent = await upsert('amp_agent', agentPayload);
        if (!savedAgent?.id) throw new Error('Failed to save agent');

        const agentId = savedAgent.id;
        selectedAgentId.value = agentId;

        // Sync actions: upsert current, delete removed
        const existingActionIds = agentActions.value.filter(a => a.id && !a._tempId).map(a => a.id);
        const savedActionIds = [];

        for (let i = 0; i < agentActions.value.length; i++) {
          const action = agentActions.value[i];
          const actionPayload = {
            ...(action.id && !action._tempId ? { id: action.id } : {}),
            agent_id: agentId,
            action_type: action.action_type,
            name: action.name || null,
            is_enabled: action.is_enabled !== false,
            variable_config: action.variable_config || {},
            guardrail_config: action.guardrail_config || {},
            eligibility_conditions: action.eligibility_conditions || null,
            sort_order: i + 1,
          };
          const saved = await upsert('amp_agent_action', actionPayload);
          if (saved?.id) savedActionIds.push(saved.id);
        }

        const removedActionIds = existingActionIds.filter(id => !savedActionIds.includes(id));
        if (removedActionIds.length) await deleteRows('amp_agent_action', 'id', removedActionIds);

        // Sync outcomes: upsert current, delete removed
        const existingOutcomeIds = agentOutcomes.value.filter(o => o.id && !o._tempId).map(o => o.id);
        const savedOutcomeIds = [];

        for (let i = 0; i < agentOutcomes.value.length; i++) {
          const outcome = agentOutcomes.value[i];
          const outcomePayload = {
            ...(outcome.id && !outcome._tempId ? { id: outcome.id } : {}),
            agent_id: agentId,
            name: outcome.name || null,
            event_type: outcome.event_type || null,
            event_filter: outcome.event_filter || null,
            classification: outcome.classification || 'good',
            weight_column: outcome.weight_column || null,
            sort_order: i + 1,
          };
          const saved = await upsert('amp_agent_outcome', outcomePayload);
          if (saved?.id) savedOutcomeIds.push(saved.id);
        }

        const removedOutcomeIds = existingOutcomeIds.filter(id => !savedOutcomeIds.includes(id));
        if (removedOutcomeIds.length) await deleteRows('amp_agent_outcome', 'id', removedOutcomeIds);

        // Refresh data
        const full = await fetchAgentFull(agentId);
        if (full) {
          agentActions.value = full.actions;
          agentOutcomes.value = full.outcomes;
          setSelectedAgent(full.agent);
        }

        isDirtyState.value = false;
        setIsDirty(false);

        emit('trigger-event', {
          name: 'agent-saved',
          event: { agent: savedAgent, actions: agentActions.value, outcomes: agentOutcomes.value },
        });
      } catch (err) {
        console.error('[AgentBuilder] Save error:', err);
        saveError.value = err?.message || 'An error occurred while saving';
        emit('trigger-event', { name: 'error', event: { message: saveError.value } });
      } finally {
        isSaving.value = false;
      }
    };

    // ─── Toggle Status ───────────────────────────────
    const handleToggleStatus = async (agent, newStatus) => {
      if (!agent?.id) return;
      try {
        await patchRow('amp_agent', agent.id, { is_active: newStatus });
        agents.value = agents.value.map(a =>
          a.id === agent.id ? { ...a, is_active: newStatus } : a
        );
        setAgentsVar(agents.value);
        emit('trigger-event', {
          name: newStatus ? 'agent-activated' : 'agent-deactivated',
          event: { agentId: agent.id, is_active: newStatus },
        });
      } catch (err) {
        console.error('[AgentBuilder] Toggle status error:', err);
        fetchAgents();
      }
    };

    // ─── Computed Styles ─────────────────────────────
    const rootStyle = computed(() => ({
      '--agent-builder-bg': props.content?.backgroundColor || 'var(--p-color-bg)',
    }));

    // ─── Init ────────────────────────────────────────
    const initData = async () => {
      if (!supabaseUrl.value || !authToken.value) return;
      await Promise.all([
        fetchAgents(),
        fetchActionTypeConfigs(),
        fetchActionOptions(),
        fetchCollections(),
      ]);
    };

    onMounted(() => {
      initData();
    });

    watch(
      () => [props.content?.supabaseUrl, props.content?.authToken],
      () => { initData(); },
    );

    // ─── Exposed Actions ─────────────────────────────
    const refresh = () => fetchAgents();

    const editAgent = async (args) => {
      const agentId = args?.agentId;
      if (!agentId) return;
      const agent = agents.value.find(a => a.id === agentId);
      if (agent) await openAgent(agent);
    };

    const back = () => goBack();

    expose({ save: saveAgent, refresh, createAgent, editAgent, back });

    /* wwEditor:start */
    const isEditing = computed(() => props.wwEditorState?.isEditing);
    /* wwEditor:end */

    return {
      currentView, activeTab, tabs, isLoading, isSaving, saveError,
      agents, form, agentActions, agentOutcomes, isDirtyState,
      actionTypeConfigs, actionOptionsData, collectionsData,
      rootStyle,
      createAgent, openAgent, goBack,
      handleFormUpdate, handleActionsUpdate, handleOutcomesUpdate,
      saveAgent, handleToggleStatus,
      /* wwEditor:start */
      isEditing,
      /* wwEditor:end */
    };
  },
};
</script>

<style lang="scss" scoped>
@import 'polaris-weweb-styles';

.agent-builder {
  @include polaris-tokens;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 400px;
  font-family: var(--p-font-family-sans);
  background: var(--agent-builder-bg, var(--p-color-bg));
  overflow: hidden;
}

// ═══ LIST VIEW ═══
.list-view {
  flex: 1;
  padding: var(--p-space-600);
  overflow-y: auto;
}

// ═══ EDITOR VIEW ═══
.editor-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--p-space-300) var(--p-space-600);
  background: var(--p-color-bg-surface);
  border-bottom: var(--p-border-width-025) solid var(--p-color-border);
  flex-shrink: 0;
}

.editor-tabs {
  display: flex;
  gap: 0;
  background: var(--p-color-bg-surface);
  border-bottom: var(--p-border-width-025) solid var(--p-color-border);
  padding: 0 var(--p-space-600);
  flex-shrink: 0;
  overflow-x: auto;
}

.editor-tab {
  display: flex;
  align-items: center;
  gap: var(--p-space-200);
  padding: var(--p-space-300) var(--p-space-400);
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: var(--p-font-size-325);
  font-weight: var(--p-font-weight-medium);
  color: var(--p-color-text-secondary);
  border-bottom: 2px solid transparent;
  transition: all var(--p-motion-duration-150) var(--p-motion-ease);
  white-space: nowrap;
  font-family: var(--p-font-family-sans);

  &:hover {
    color: var(--p-color-text);
    background: var(--p-color-bg-surface-hover);
  }

  &--active {
    color: var(--p-color-text);
    border-bottom-color: var(--p-color-text);
  }

  &__icon {
    font-size: 16px;
    line-height: 1;
  }

  &__label {
    line-height: 1;
  }
}

.editor-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--p-space-600);
}

// Responsive
@media (max-width: 768px) {
  .list-view,
  .editor-content {
    padding: var(--p-space-400);
  }

  .editor-header {
    padding: var(--p-space-300) var(--p-space-400);
  }

  .editor-tabs {
    padding: 0 var(--p-space-400);
  }
}
</style>
