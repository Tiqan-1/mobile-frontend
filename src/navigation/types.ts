import type { StackScreenProps } from '@react-navigation/stack';
import type { Paths } from '@/navigation/paths';

export type RootStackParamList = {
  [Paths.AccessibilitySettings]: undefined;
  [Paths.Auth]: undefined;
  [Paths.Example]: undefined;
  [Paths.Login]: undefined;
  [Paths.Main]: undefined;
  [Paths.Program]: Program;
  [Paths.Programs]: undefined;
  [Paths.SignUp]: undefined;

  [Paths.Startup]: undefined;
  [Paths.Subscrption]: Subscription;
  [Paths.TabNav]: undefined;
};

export type RootScreenProps<
  S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;
