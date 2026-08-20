import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { Paths } from '@/navigation/paths';
import { Lesson, Program, Subscription } from '@/types/program';

export type RootStackParamList = {
  [Paths.AccessibilitySettings]: undefined;
  [Paths.Auth]: undefined;
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

export type RootTabScreenProps<
  S extends keyof RootStackParamList = keyof RootStackParamList,
> = BottomTabScreenProps<RootStackParamList, S>;
