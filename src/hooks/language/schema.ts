import { z } from 'zod';

export const enum SupportedLanguages {
  AR = 'ar',
  EN = 'en',
  FR = 'fr',
}

export const languageSchema = z.enum([
  SupportedLanguages.AR,
  SupportedLanguages.EN,
]);

export type Language = z.infer<typeof languageSchema>;
