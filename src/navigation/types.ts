import type { StackScreenProps } from '@react-navigation/stack';
import type { Paths } from '@/navigation/paths';

export type RootStackParamList = {
  [Paths.AccessibilitySettings]: undefined;
  [Paths.Auth]: undefined;
  [Paths.Example]: undefined;
  [Paths.ForgotPassword]: undefined;
  [Paths.Login]: { email?: string } | undefined;
  [Paths.Main]: undefined;
  [Paths.Menu]: undefined;
  [Paths.PDF]: Lesson;
  [Paths.Program]: Program;

  [Paths.Programs]: undefined;
  [Paths.SignUp]: undefined;
  [Paths.Startup]: undefined;
  [Paths.Subscription]: Subscription;
  [Paths.TabNav]: undefined;
  [Paths.TodayLessons]: undefined;
};

export type RootScreenProps<
  S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;
