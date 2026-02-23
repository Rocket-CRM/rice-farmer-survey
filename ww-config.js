export default {
  editor: {
    label: {
      en: 'Agent Builder',
    },
    icon: 'robot',
    customStylePropertiesOrder: [
      'backgroundColor',
    ],
    customSettingsPropertiesOrder: [
      'supabaseUrl',
      'supabaseAnonKey',
      'authToken',
    ],
  },
  actions: [
    {
      name: 'save',
      label: { en: 'Save Agent' },
      action: 'save',
      /* wwEditor:start */
      actionDescription: {
        en: 'Validates and saves the current agent with all actions and outcomes',
      },
      /* wwEditor:end */
    },
    {
      name: 'refresh',
      label: { en: 'Refresh Agent List' },
      action: 'refresh',
      /* wwEditor:start */
      actionDescription: {
        en: 'Reloads the agents list from the database',
      },
      /* wwEditor:end */
    },
    {
      name: 'createAgent',
      label: { en: 'Create New Agent' },
      action: 'createAgent',
      /* wwEditor:start */
      actionDescription: {
        en: 'Opens the editor with a blank agent form',
      },
      /* wwEditor:end */
    },
    {
      name: 'editAgent',
      label: { en: 'Edit Agent' },
      action: 'editAgent',
      args: [
        {
          name: 'agentId',
          label: { en: 'Agent ID' },
          type: 'Text',
          required: true,
        },
      ],
      /* wwEditor:start */
      actionDescription: {
        en: 'Opens the editor for the specified agent by ID',
      },
      /* wwEditor:end */
    },
    {
      name: 'back',
      label: { en: 'Back to List' },
      action: 'back',
      /* wwEditor:start */
      actionDescription: {
        en: 'Navigates back to the agent list view',
      },
      /* wwEditor:end */
    },
  ],
  triggerEvents: [
    {
      name: 'agent-saved',
      label: { en: 'On Agent Saved' },
      event: { agent: {}, actions: [], outcomes: [] },
      default: true,
      /* wwEditor:start */
      getTestEvent: '() => ({ agent: { id: "test-id", name: "Test Agent" }, actions: [], outcomes: [] })',
      /* wwEditor:end */
    },
    {
      name: 'agent-activated',
      label: { en: 'On Agent Activated' },
      event: { agentId: '', is_active: true },
      default: true,
      /* wwEditor:start */
      getTestEvent: '() => ({ agentId: "test-id", is_active: true })',
      /* wwEditor:end */
    },
    {
      name: 'agent-deactivated',
      label: { en: 'On Agent Deactivated' },
      event: { agentId: '', is_active: false },
      default: true,
      /* wwEditor:start */
      getTestEvent: '() => ({ agentId: "test-id", is_active: false })',
      /* wwEditor:end */
    },
    {
      name: 'view-changed',
      label: { en: 'On View Changed' },
      event: { view: 'list', mode: '', agentId: '' },
      default: true,
      /* wwEditor:start */
      getTestEvent: '() => ({ view: "detail", mode: "edit", agentId: "test-id" })',
      /* wwEditor:end */
    },
    {
      name: 'error',
      label: { en: 'On Error' },
      event: { message: '' },
      default: true,
      /* wwEditor:start */
      getTestEvent: '() => ({ message: "An error occurred" })',
      /* wwEditor:end */
    },
  ],
  properties: {
    // ─── Connection ────────────────────────────────────
    supabaseUrl: {
      label: { en: 'Supabase URL' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: '',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Supabase project URL (e.g., https://abc.supabase.co)',
      },
      propertyHelp:
        'Your Supabase project URL. Required for all API calls to fetch agents, action type configs, and entity options.',
      /* wwEditor:end */
    },
    supabaseAnonKey: {
      label: { en: 'Supabase Anon Key' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: '',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Supabase publishable/anon key for the apikey header',
      },
      propertyHelp:
        'The publishable API key from your Supabase project settings.',
      /* wwEditor:end */
    },
    authToken: {
      label: { en: 'Auth Token (JWT)' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: '',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Current admin user JWT. Bind to Supabase plugin access token.',
      },
      propertyHelp:
        'The current admin user\'s JWT from the Supabase auth session. Bind to your Supabase plugin\'s access_token.',
      /* wwEditor:end */
    },

    // ─── Styling ───────────────────────────────────────
    backgroundColor: {
      label: { en: 'Background Color' },
      type: 'Color',
      section: 'style',
      defaultValue: '',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Background color of the component',
      },
      /* wwEditor:end */
    },
  },
};
