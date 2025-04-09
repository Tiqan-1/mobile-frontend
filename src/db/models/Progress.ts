import { Model } from '@nozbe/watermelondb';
import { date, field, relation } from '@nozbe/watermelondb/decorators';

export default class Progress extends Model {
  static table = 'progress';

  @field('completed') completed;
  @date('completed_at') completedAt;
  @field('level_id') levelId;
  @field('subscription_id') subscriptionId;
  @date('synced_at') syncedAt;
  @field('task_id') taskId;
}