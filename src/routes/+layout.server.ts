import i18n from '$lib/i18n';
import type { LayoutServerLoad } from './$types';
import { logger } from '$lib/utils/logger';

export const load: LayoutServerLoad = async ({ locals }) => {
  const { i18n: i18nData, flags } = locals;

  if (i18nData.lang) await i18n.loadTranslations(i18nData.lang);
  if (flags) logger.debug('Loaded client flags:', flags);

  return { ...locals, flags };
};
