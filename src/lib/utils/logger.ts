import { browser, dev } from '$app/environment';
import chalk from 'chalk';

const loggerLevels = ['error', 'warn', 'debug'] as const;

const createLogger = (prefix: string | null, color: string | null) => {
  const defaultColors: Record<(typeof loggerLevels)[number], string> = {
    error: '#dc2626',
    warn: '#ca8a04',
    debug: '#2563eb',
  };
  return Object.fromEntries(
    loggerLevels.map((l) => {
      prefix ??= `[${l}]:`;
      color ??= defaultColors[l];
      const styledPrefix = browser
        ? [`%c${prefix}`, `color: ${color}; font-weight: bold;`]
        : [chalk.hex(color).bold(prefix)];
      return [
        l,
        (...args: unknown[]) => {
          // Log everything in dev and only errors in prod
          if (dev || (!dev && loggerLevels.indexOf(l) <= 0)) console[l](...styledPrefix, ...args);
        },
      ];
    })
  );
};

export const logger = createLogger(null, null);
export const i18nLogger = createLogger('[i18n]:', '#f96743');
