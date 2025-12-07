import { error, redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import i18n from '$lib/i18n';
import { urlStartsWith } from '$lib/utils/';
import { auth } from '$lib/server/auth';
import { logger } from '$lib/utils/logger';
import { isRoleAbove } from '$lib/roles';
import { env } from '$env/dynamic/private';
import { FlagDAO, type FlagDecisions } from '$lib/server/db/flag';
import config from '$conf';
import { rateLimit } from '$lib/server/rateLimit';
import Theming, {
  availableModes,
  availableThemes,
  effectiveModes,
} from '$lib/theming/index.svelte';
import z from 'zod';
import { getCookiePrefix } from '$lib/server/utils';

const NEED_AUTH_ROUTES: string[] = ['/app', '/api/sse'];

const authHandler: Handle = async ({ event, resolve }) => {
  const { url, cookies, locals } = event;

  const token =
    cookies.get(getCookiePrefix('token')) ||
    event.request.headers.get('Authorization')?.replace('Bearer ', '') ||
    null;

  // Check if the user is logged in, and if so, retrieve the user data
  if (token) {
    try {
      const user = await auth(token);
      if (user) {
        locals.user = user;
      } else {
        cookies.delete(getCookiePrefix('token'), { path: '/' });
        delete locals?.user;
      }
    } catch (error) {
      logger.error('Error verifying token:', error);
      delete locals.user;
      cookies.delete(getCookiePrefix('token'), { path: '/' });
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

  let locale = cookies.get(getCookiePrefix('locale'));

  if (!locale) {
    // Get user preferred locale
    locale = `${`${request.headers.get('accept-language')}`.match(/^[a-z]{2}/i)}`.toLowerCase();
  }
  // Set default locale if user preferred locale does not match
  if (!i18n.locales.includes(locale as never)) locale = i18n.defaultLocale;

  const localeConfig = i18n.config.loaders.find((l) => l.locale === locale);

  event.locals.i18n = {
    lang: locale ?? i18n.defaultLocale,
    dir: localeConfig?.dir ?? 'ltr',
  };

  return resolve(event);
};

const flagHandler: Handle = async ({ event, resolve }) => {
  if (config?.experimental?.flags) {
    let entity: string;
    if (event.locals?.user) {
      entity = event.locals.user.id;
    } else {
      if (!event.cookies.get(getCookiePrefix('flag_id'))) {
        entity = crypto.randomUUID();
        event.cookies.set(getCookiePrefix('flag_id'), entity, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 365,
        });
      } else {
        entity = event.cookies.get(getCookiePrefix('flag_id'))!;
      }
    }

    const flagDecisions: FlagDecisions = {};
    const allFlags = await FlagDAO.getAllFlags();

    for (const flag of allFlags) {
      flagDecisions[flag.key] = {
        value: await flag.decide(entity, flag.chance),
        override: flag.overrideValue,
      };
    }
    event.locals.flags = flagDecisions;
  }

  return resolve(event);
};

const rateLimitHandler: Handle = async ({ event, resolve }) => {
  const ip = event.getClientAddress();
  try {
    await rateLimit(ip);
  } catch (err) {
    logger.error(err);
    throw error(429, 'Too many requests, please try again later.');
  }

  return resolve(event);
};

const cookieConsentHandler: Handle = async ({ event, resolve }) => {
  const consent = event.cookies.get(getCookiePrefix('cookie_consent'));
  if (!consent || consent === 'pending') {
    event.cookies.set(getCookiePrefix('cookie_consent'), 'pending', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365,
    });
    event.locals.cookieConsent = 'pending';
  } else {
    event.locals.cookieConsent = JSON.parse(consent);
  }
  return resolve(event);
};

const themeHandler: Handle = async ({ event, resolve }) => {
  const themingCookie = event.cookies.get(getCookiePrefix('theming'));
  const themingCookieStruct = z.object({
    mode: z.object({
      mode: z.enum(availableModes),
      effective: z.enum(effectiveModes),
    }),
    theme: z.enum(availableThemes),
  });
  let theme = null;
  let mode = null;
  if (themingCookie) {
    try {
      const parsed = themingCookieStruct.parse(JSON.parse(themingCookie));
      theme = parsed.theme;
      mode = parsed.mode;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // Invalid cookie, ignore
    }
  }
  if (!theme) {
    theme = availableThemes[0];
  }
  if (!mode) {
    mode = { mode: 'system', effective: 'dark' };
  }
  event.locals.theme = {
    theme: Theming.getTheme(theme),
    mode: {
      mode: Theming.getMode(mode.mode),
      effective: mode.effective,
    },
  };
  return resolve(event);
};

const replaceHandler: Handle = async ({ event, resolve }) => {
  const operations = {
    '%lang%': event.locals.i18n.lang,
    '%dir%': event.locals.i18n.dir || 'ltr',
    '%theme%': event.locals.theme.theme,
    '%mode%': event.locals.theme.mode.effective,
  };
  return resolve(event, {
    transformPageChunk: ({ html }) => {
      let transformed = html;
      for (const [key, value] of Object.entries(operations)) {
        transformed = transformed.replaceAll(key, value);
      }
      return transformed;
    },
  });
};

export const handle = sequence(
  authHandler,
  rateLimitHandler,
  cookieConsentHandler,
  flagHandler,
  themeHandler,
  i18nHandler,
  replaceHandler
);
