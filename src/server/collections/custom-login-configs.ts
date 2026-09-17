import { defineCollection } from '@nocobase/database';

export default defineCollection({
  name: 'custom_login_configs',
  title: 'Custom Login Configs',
  fields: [
    {
      name: 'key',
      type: 'string',
      unique: true,
      defaultValue: 'default',
    },
    {
      name: 'enabled',
      type: 'boolean',
      defaultValue: true,
    },
    {
      name: 'template',
      type: 'string',
      defaultValue: 'split', // 'split' | 'center'
    },
    {
      name: 'canvasParentId',
      type: 'string',
      defaultValue: 'custom_login_canvas_page',
    },
    {
      name: 'themeConfig',
      type: 'json',
      defaultValue: {},
    },
    {
      name: 'containerStyle',
      type: 'string',
      defaultValue: 'transparent',
    },
    {
      name: 'canvasWidth',
      type: 'string',
      defaultValue: 'wide',
    },
    {
      name: 'customBlocks',
      type: 'json',
      defaultValue: [],
    },
    {
      name: 'gridSchema',
      type: 'json',
      defaultValue: null,
    },
    {
      name: 'allowedWorkflowKeys',
      type: 'json',
      defaultValue: [],
    },
    {
      name: 'rateLimitPerMinute',
      type: 'integer',
      defaultValue: 15,
    },
  ],
});
