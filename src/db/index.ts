import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema';
import Progress from './models/Progress';
import migrations from './models/migrations'
import { IsIOS } from '@/utils/constants';

const adapter = new SQLiteAdapter({
  schema,
  // Optional migrations
  migrations,
  jsi: IsIOS,

  // Optional logging
  onSetUpError: error => {
    console.error(error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Progress],
});

