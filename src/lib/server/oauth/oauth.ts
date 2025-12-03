import * as arctic from 'arctic';
import { createOAuthClient, type OAuthConfig } from './client';
import { Caching } from '../db/caching';
import { logger } from '$lib/utils/logger';

export async function generateAuthorizationURL(config: OAuthConfig) {
  try {
    const client = createOAuthClient();
    const state = arctic.generateState();

    const scopes = config.scopes || ['openid', 'profile', 'email'];

    let url: URL;
    let codeVerifier: string | null = null;

    if (config.usePKCE) {
      codeVerifier = arctic.generateCodeVerifier();
      url = client.createAuthorizationURLWithPKCE(
        config.authorizationEndpoint,
        state,
        arctic.CodeChallengeMethod.S256,
        codeVerifier,
        scopes
      );
      // Store code verifier for later use
      await Caching.set(`oauth:codeVerifier:${state}`, codeVerifier, { ttl: 10 * 60 }); // 10 minutes
    } else {
      url = client.createAuthorizationURL(config.authorizationEndpoint, state, scopes);
    }

    // Store state for validation
    await Caching.set(`oauth:state:${state}`, config.tokenEndpoint, { ttl: 10 * 60 }); // 10 minutes

    return { url, state };
  } catch (error) {
    logger.error('Error generating OAuth authorization URL:', error);
    throw error;
  }
}

export async function validateAuthorizationCode(code: string, state: string, config: OAuthConfig) {
  try {
    const client = createOAuthClient();

    // Verify state
    const storedTokenEndpoint = await Caching.get<string>(`oauth:state:${state}`);
    if (!storedTokenEndpoint) {
      throw new Error('Invalid or expired state');
    }

    if (storedTokenEndpoint !== config.tokenEndpoint) {
      throw new Error('State mismatch');
    }

    let tokens: arctic.OAuth2Tokens;

    if (config.usePKCE) {
      const codeVerifier = await Caching.get<string>(`oauth:codeVerifier:${state}`);
      if (!codeVerifier) {
        throw new Error('Code verifier not found');
      }
      tokens = await client.validateAuthorizationCode(config.tokenEndpoint, code, codeVerifier);
      await Caching.del(`oauth:codeVerifier:${state}`);
    } else {
      tokens = await client.validateAuthorizationCode(config.tokenEndpoint, code, null);
    }

    // Clean up state
    await Caching.del(`oauth:state:${state}`);

    return tokens;
  } catch (error) {
    logger.error('Error validating OAuth authorization code:', error);

    if (error instanceof arctic.OAuth2RequestError) {
      throw new Error(`OAuth error: ${error.code}`);
    }
    if (error instanceof arctic.ArcticFetchError) {
      throw new Error('Failed to communicate with OAuth provider');
    }
    throw error;
  }
}

export async function getUserInfo(accessToken: string, userInfoEndpoint: string) {
  try {
    const response = await fetch(userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.status}`);
    }

    const userInfo = await response.json();
    return userInfo;
  } catch (error) {
    logger.error('Error fetching user info:', error);
    throw error;
  }
}

export async function refreshAccessToken(refreshToken: string, config: OAuthConfig) {
  try {
    const client = createOAuthClient();
    const tokens = await client.refreshAccessToken(config.tokenEndpoint, refreshToken, []);
    return tokens;
  } catch (error) {
    logger.error('Error refreshing access token:', error);
    throw error;
  }
}
