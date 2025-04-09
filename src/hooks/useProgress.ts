import { useDatabase } from '@nozbe/watermelondb/hooks';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/db';

export const useProgress = (subscriptionId: string) => {
  // const database = useDatabase();

  const saveProgress = async (progress: {
    completed: boolean;
    levelId: string;
    taskId: string;
  }) => {
    await database.write(async () => {
      await database.get('progress').create(record => {
        record.subscriptionId = subscriptionId;
        record.levelId = progress.levelId;
        record.taskId = progress.taskId;
        record.completed = progress.completed;
        record.completedAt = new Date();
      });
    });
  };

  const getProgress = async () => {
    return await database
      .get('progress')
      .query(Q.where('subscription_id', subscriptionId))
      .fetch();
  };

  return { saveProgress, getProgress };
};