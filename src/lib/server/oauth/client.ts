import { env } from '$env/dynamic/private';
import { logger } from '$lib/utils/logger';
import { OAuth2Client } from 'arctic';

export function getOAuthConfig(): OAuthConfig {
  let enabled = env.OAUTH_ENABLED == 'true';
  const clientId = env.OAUTH_CLIENT_ID;
  const clientSecret = env.OAUTH_CLIENT_SECRET;
  const redirectURI = `${env.ORIGIN || 'http://localhost:5173'}/auth/oauth/callback`;
  const providerName = env.OAUTH_PROVIDER_NAME || 'OAuth Provider';
  const authorizationEndpoint = env.OAUTH_AUTHORIZATION_ENDPOINT;
  const tokenEndpoint = env.OAUTH_TOKEN_ENDPOINT;
  const userInfoEndpoint = env.OAUTH_USERINFO_ENDPOINT;
  const usePKCE = true;
  const adminGroups = env.OAUTH_ADMIN_GROUPS
    ? env.OAUTH_ADMIN_GROUPS.split(',').map((group) => group.trim())
    : [];

  if (!authorizationEndpoint || !tokenEndpoint || !userInfoEndpoint) {
    logger.warn('OAuth endpoints not fully configured, disabling OAuth');
    enabled = false;
  }

  return {
    enabled,
    clientId,
    clientSecret,
    redirectURI,
    providerName,
    scopes: 'openid profile email offline_access'.split(' '),
    authorizationEndpoint,
    tokenEndpoint,
    userInfoEndpoint,
    usePKCE,
    adminGroups,
  } as OAuthConfig;
}

export function createOAuthClient() {
  const { clientId, clientSecret, redirectURI } = getOAuthConfig();

  if (!clientId || !clientSecret) {
    throw new Error('OAuth credentials not configured');
  }

  return new OAuth2Client(clientId, clientSecret, redirectURI);
}

export type OAuthConfig = OAuthConfigEnabled | OAuthConfigNotEnabled;

interface OAuthConfigNotEnabled {
  enabled: false;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  clientId: string;
  clientSecret: string;
  redirectURI: string;
  providerName: string;
  scopes?: string[];
  usePKCE?: boolean;
  adminGroups: string[];
}

interface OAuthConfigEnabled {
  enabled: true;
  providerName: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  clientId: string;
  clientSecret: string;
  redirectURI: string;
  scopes?: string[];
  usePKCE?: boolean;
  adminGroups: string[];
}
