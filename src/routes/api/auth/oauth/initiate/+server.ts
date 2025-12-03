import { json } from '@sveltejs/kit';
import { generateAuthorizationURL, getOAuthConfig } from '$lib/server/oauth';
import { Caching } from '$lib/server/db/caching';
import { logger } from '$lib/utils/logger';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async () => {
  try {
    const config = getOAuthConfig();

    // Validate required fields
    if (!config.authorizationEndpoint || !config.tokenEndpoint || !config.userInfoEndpoint) {
      return json({ error: 'Missing required OAuth configuration' }, { status: 400 });
    }
    const { url, state } = await generateAuthorizationURL(config);

    // Store config for callback
    await Caching.set(`oauth:config:${state}`, config, { ttl: 10 * 60 });

    return json({
      authorizationUrl: url.toString(),
      state,
    });
  } catch (error) {
    logger.error('Error initiating OAuth:', error);
    return json({ error: 'Failed to initiate OAuth' }, { status: 500 });
  }
};
