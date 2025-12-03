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
  }
  // Set default locale if user preferred locale does not match
  if (!i18n.locales.includes(locale as never)) locale = i18n.defaultLocale;

  const localeConfig = i18n.config.loaders.find((l) => l.locale === locale);

  event.locals.i18n = {
    lang: locale ?? i18n.defaultLocale,
    dir: localeConfig?.dir ?? 'ltr',
  };

  return resolve(event, {
    transformPageChunk: ({ html }) =>
      html.replace('%lang%', i18n.locale).replace('%dir%', localeConfig!.dir || 'ltr'),
  });
};

const flagHandler: Handle = async ({ event, resolve }) => {
  if (config?.experimental?.flags) {
    let entity: string;
    if (event.locals?.user) {
      entity = event.locals.user.id;
    } else {
      if (!event.cookies.get('flag_id')) {
        entity = crypto.randomUUID();
        event.cookies.set('flag_id', entity, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 365,
        });
      } else {
        entity = event.cookies.get('flag_id')!;
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
    console.log(err);
    throw error(429, 'Too many requests, please try again later.');
  }

  return resolve(event);
};

const cookieConsentHandler: Handle = async ({ event, resolve }) => {
  const consent = event.cookies.get('cookie_consent');
  if (!consent || consent === 'pending') {
    event.cookies.set('cookie_consent', 'pending', {
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

export const handle = sequence(
  authHandler,
  rateLimitHandler,
  cookieConsentHandler,
  flagHandler,
  i18nHandler
);
