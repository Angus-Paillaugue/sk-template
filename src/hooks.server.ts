import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import i18n from '$lib/i18n';
import { urlStartsWith } from '$lib/utils/';
import { auth } from '$lib/server/auth';
import { logger } from '$lib/utils/logger';
import { isRoleAbove } from '$lib/roles';
import { env } from '$env/dynamic/private';
import { flags } from '$lib/flags';
import { FlagDAO } from '$lib/server/db/flag';
import config from '$conf';

const NEED_AUTH_ROUTES: string[] = ['/app', '/api/sse'];

const authHandler: Handle = async ({ event, resolve }) => {
  const { url, cookies, locals } = event;

  const token =
    cookies.get('token') ||
    event.request.headers.get('Authorization')?.replace('Bearer ', '') ||
    null;

  // Check if the user is logged in, and if so, retrieve the user data
  if (token) {
    try {
      const user = await auth(token);
      if (user) {
        locals.user = user;
      } else {
        cookies.delete('token', { path: '/' });
        delete locals?.user;
      }
    } catch (error) {
      logger.error('Error verifying token:', error);
      delete locals.user;
      cookies.delete('token', { path: '/' });
    }
  }

  if (!locals.user && urlStartsWith(url.pathname, NEED_AUTH_ROUTES)) {
    // If the user is not logged in and tries to access a protected route, redirect to the login page
    redirect(303, '/auth');
  }

  if (
    locals.user &&
    urlStartsWith(url.pathname, ['/app/admin', '/api/admin']) &&
    !isRoleAbove(locals.user.role, 'admin')
  ) {
    // If is trying to access any admin routes without an account or role
    redirect(303, '/app');
  }

  const response = await resolve(event);
  response.headers.set(
    'X-Robots-Tag',
    urlStartsWith(url.pathname, NEED_AUTH_ROUTES) ? 'noindex, nofollow' : 'index, follow'
  );

  return response;
};

const i18nHandler: Handle = async ({ event, resolve }) => {
  const { request, cookies } = event;

  let locale = cookies.get('locale');

  if (!locale) {
    // Get user preferred locale
    locale = `${`${request.headers.get('accept-language')}`.match(/^[a-z]{2}/i)}`.toLowerCase();

    // Set default locale if user preferred locale does not match
    if (!i18n.locales.includes(locale as never)) locale = i18n.defaultLocale;
  }

  const localeConfig = i18n.config.loaders.find((l) => l.locale === locale);

  event.locals.i18n = {
    lang: locale,
    dir: localeConfig!.dir || 'ltr',
  };

  return resolve(event, {
    transformPageChunk: ({ html }) =>
      html.replace('%lang%', i18n.locale).replace('%dir%', localeConfig!.dir || 'ltr'),
  });
};

const flagHandler: Handle = async ({ event, resolve }) => {
  if (config?.experimental?.flags) {
    const flagDecisions: Record<string, boolean> = {};

    for (const flag of flags.getAllFlags()) {
      if (!event.cookies.get('flag_id')) {
        event.cookies.set('flag_id', crypto.randomUUID(), {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 365,
        });
      }
      const entity = event.cookies.get('flag_id')!;
      if (flag.decide) {
        const overrideFlag = await FlagDAO.getFlag(flag.key);
        let decision: boolean;
        if (overrideFlag) {
          decision = overrideFlag.override_value;
        } else {
          decision = await flag.decide(entity);
        }
        flagDecisions[flag.key] = decision;
      }
    }
    event.locals.flags = flagDecisions;
  }

  return resolve(event);
};

export const handle = sequence(authHandler, flagHandler, i18nHandler);
