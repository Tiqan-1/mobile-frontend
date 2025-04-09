import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'progress',
      columns: [
        { name: 'subscription_id', type: 'string' },
        { name: 'level_id', type: 'string', isIndexed: true },
        { name: 'task_id', type: 'string', isIndexed: true },
        { name: 'completed', type: 'boolean' },
        { name: 'completed_at', type: 'number' },
        { name: 'synced_at', type: 'number' },
      ],
    }),
  ],
});
