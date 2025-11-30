import { config } from './config';
import type enTranslations from './messages/en.json';
import langs from './lang.json';

type Required<T> = {
  [P in keyof T]-?: T[P];
};

export type Dir = 'rtl' | 'ltr';
type LangCode = keyof typeof langs;

interface Loader<T = Record<string, unknown>> {
  locale: LangCode;
  dir?: Dir;
  loader: () => Promise<T>;
}

type InternalConfig<T = Record<string, unknown>> = Required<Config<T>>;

export interface Config<T = Record<string, unknown>> {
  defaultLocale: string;
  loaders: Loader<T>[];
}

// Helper type to flatten nested object keys with dot notation
type FlattenKeys<T, P extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object ? FlattenKeys<T[K], `${P}${K}.`> : `${P}${K}`;
    }[keyof T & string]
  : never;

// Create an i18n instance with proper typing
type Translations = typeof enTranslations;

export class i18n {
  private _config: InternalConfig<Translations>;
  private _currentPageTranslations = $state<Record<string, string>>({});

  locale = $state<string>('en');
  dir = $state<Dir>('ltr');

  constructor(config: Config<Translations>) {
    this._config = this.normalizeConfig(config);
    this.locale = config.defaultLocale;
    console.debug(`i18n initialized with default locale "${config.defaultLocale}"`);
  }

  private normalizeConfig(config: Config<Translations>): InternalConfig<Translations> {
    const defaultDir = 'ltr';
    config.loaders.map((loader) => {
      loader.dir ??= defaultDir;
      return loader;
    });

    return config;
  }

  get config() {
    return this._config;
  }

  get locales() {
    return this._config.loaders.map((loader) => loader.locale);
  }

  get defaultLocale() {
    return this._config.defaultLocale;
  }

  getLanguageName(lang: LangCode): string {
    return langs[lang] || lang;
  }

  setLocale = (locale: string, hook?: boolean) => {
    if (!locale) {
      return;
    }
    console.debug(`Setting locale to "${locale}"`);
    if (this.isLocaleSupported(locale)) {
      this.loadTranslations(locale);
      if (locale !== this.locale) {
        this.locale = locale;
        this.dir = config.loaders.find((l) => l.locale === locale)?.dir as Dir;
      }
    } else {
      console.error(`Locale ${locale} not supported`);
      throw new Error(`Locale ${locale} not supported`);
    }

    if (hook) {
      return;
    }

    // First delete the old locale cookie
    document.cookie = `locale=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    // Then set the new locale cookie
    document.cookie = `locale=${locale}; path=/; max-age=31536000`;
  };

  private isLocaleSupported(locale: string): boolean {
    return this._config.loaders.some((loader) => loader.locale === locale);
  }

  // Take a deeply nested object and flatten it into a single level object with dot notation
  private flattenTranslations(
    translations: Record<string, unknown>,
    prefix = ''
  ): Record<string, string> {
    return Object.entries(translations).reduce(
      (acc, [key, value]) => {
        if (typeof value === 'object' && value !== null) {
          return {
            ...acc,
            ...this.flattenTranslations(value as Record<string, unknown>, `${prefix}${key}.`),
          };
        }
        acc[`${prefix}${key}`] = value as string;
        return acc;
      },
      {} as Record<string, string>
    );
  }

  // Load translations for the current locale in memory
  loadTranslations = async (locale: string) => {
    if (locale === this.locale && Object.keys(this._currentPageTranslations).length !== 0) return;
    const loader = this._config.loaders.find((l) => l.locale === locale);
    if (loader) {
      this._currentPageTranslations = this.flattenTranslations(await loader.loader());
    } else {
      console.error(`Loader for locale ${locale} not found`);
      throw new Error(`Loader for locale ${locale} not found`);
    }

    console.debug(
      `${Object.keys(this._currentPageTranslations).length} "${locale}" translations loaded`
    );
  };

  // Get the translations for the current page
  get translations() {
    return this._currentPageTranslations;
  }

  // Main client entrypoint to get a single translation.
  // Updates when the locale changes
  t = (key: FlattenKeys<Translations>, params?: Record<string, unknown>) => {
    if (Object.keys(this._currentPageTranslations).length === 0) {
      return key;
    }
    const translation = this._currentPageTranslations[key];
    if (translation) {
      return translation.replace(/\{{([a-zA-Z0-9]+)\}}/g, (_, index) =>
        String(params?.[index] || '')
      );
    } else {
      console.warn(`Translation for key "${key}" not found`);
    }
    return key;
  };
}
