import { redirect } from '@sveltejs/kit';
import { validateAuthorizationCode, getUserInfo, type OAuthConfig } from '$lib/server/oauth';
import { UserDAO } from '$lib/server/db/user';
import { generateAccessToken } from '$lib/server/auth';
import { Caching } from '$lib/server/db/caching';
import { logger } from '$lib/utils/logger';
import type { PageServerLoad } from './$types';

export const load = (async ({ url, cookies }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    logger.error('OAuth error from provider:', error);
    throw redirect(303, '/auth/log-in?error=' + error);
  }

  if (!code || !state) {
    logger.error('Missing code or state in callback');
    throw redirect(303, '/auth/log-in?error=missing_parameters');
  }

  try {
    // Get the stored OAuth config
    const oauthConfig = await Caching.get<OAuthConfig>(`oauth:config:${state}`);
    if (!oauthConfig) {
      throw new Error('OAuth configuration not found');
    }

    // Validate authorization code
    const tokens = await validateAuthorizationCode(code, state, oauthConfig);
    const accessToken = tokens.accessToken();

    // Get user info
    const userInfo = await getUserInfo(accessToken, oauthConfig.userInfoEndpoint);

    // Extract user details (adjust based on your OIDC provider)
    const email = userInfo.email;
    const username = userInfo.preferred_username || userInfo.name || email.split('@')[0];

    if (!email) {
      throw new Error('Email not provided by OAuth provider');
    }

    // Determine role based on groups from OIDC provider
    const userGroups = userInfo.groups || [];
    const isAdmin = userGroups.some((group: string) => oauthConfig.adminGroups.includes(group));
    const role = isAdmin ? 'admin' : 'user';

    // Check if user exists by email
    let user;
    try {
      user = await UserDAO.getUserByEmail(email);
      // Update user role if it has changed based on groups
      if (user.role !== role) {
        await UserDAO.updateUserRole(user.id, role);
        user.role = role;
      }
    } catch {
      // User doesn't exist, create new one
      // Generate a random password since they're using OAuth
      user = await UserDAO.createUser(username, email, '', {
        oauthProvider: oauthConfig.providerName,
        role,
      });
    }

    // Set session cookie
    cookies.set('token', generateAccessToken(user.id), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    throw redirect(303, '/app');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OAuth authentication failed';
    logger.error('OAuth callback error:', error);
    throw redirect(303, `/auth/log-in?error=${encodeURIComponent(message)}`);
  }
}) satisfies PageServerLoad;
