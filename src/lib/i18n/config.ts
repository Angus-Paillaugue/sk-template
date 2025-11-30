import type { Config } from './i18n.svelte';
import enTranslations from './messages/en.json';

// Use the English translations as the source of truth for types
type Translations = typeof enTranslations;

export const config: Config<Translations> = {
  defaultLocale: 'en',
  loaders: [
    {
      locale: 'en',
      loader: async () => (await import('./messages/en.json')).default,
    },
  ],
};
