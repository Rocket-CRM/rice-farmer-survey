export default {
  editor: {
    label: 'Rice Farmer Survey',
    icon: 'clipboard',
  },
  properties: {
    supabaseUrl: {
      label: { en: 'Supabase URL' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'https://wkevmsedchftztoolkmi.supabase.co',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Supabase project URL',
      },
      /* wwEditor:end */
    },
    supabaseAnonKey: {
      label: { en: 'Supabase Anon Key' },
      type: 'Text',
      section: 'settings',
      defaultValue:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZXZtc2VkY2hmdHp0b29sa21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTM2OTgsImV4cCI6MjA2NjA4OTY5OH0.bd8ELGtX8ACmk_WCxR_tIFljwyHgD3YD4PdBDpD-kSM',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Supabase anon key for authentication',
      },
      /* wwEditor:end */
    },
    accessToken: {
      label: { en: 'Access Token (Interviewer JWT)' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Supabase JWT access token of the logged-in interviewer',
      },
      /* wwEditor:end */
    },
    userId: {
      label: { en: 'User ID (Interviewer)' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'UUID of the interviewer conducting the survey',
      },
      /* wwEditor:end */
    },
    source: {
      label: { en: 'Source' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'field_interview',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Submission source identifier',
      },
      /* wwEditor:end */
    },
  },
  triggerEvents: [
    {
      name: 'survey-completed',
      label: { en: 'Survey completed' },
      event: { submissionId: '', farmerId: '', isNewUser: false },
    },
    {
      name: 'survey-closed',
      label: { en: 'Survey closed' },
      event: {},
    },
    {
      name: 'error',
      label: { en: 'Error occurred' },
      event: { message: '' },
    },
    {
      name: 'profile-updated',
      label: { en: 'Profile updated' },
      event: { farmerId: '', updatedFields: [] },
    },
    {
      name: 'phase-changed',
      label: { en: 'Phase changed' },
      event: { phase: '' },
    },
    {
      name: 'step-changed',
      label: { en: 'Step changed' },
      event: { step: 0 },
    },
  ],
  actions: [
    {
      name: 'reset',
      label: { en: 'Reset Survey' },
      action: 'reset',
    },
  ],
}
