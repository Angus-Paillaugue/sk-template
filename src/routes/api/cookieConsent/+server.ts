import { env } from '$env/dynamic/private';
import type { CookieConsent } from '$lib/Cookie';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const body = await request.json();
  const consent = body as CookieConsent;

  cookies.set('cookie_consent', JSON.stringify(consent), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365,
  });

  return new Response(null, {
    status: 200,
  });
};
