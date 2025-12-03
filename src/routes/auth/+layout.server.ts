import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getOAuthConfig } from '$lib/server/oauth';

export const load = (async ({ locals }) => {
  if (locals?.user) {
    throw redirect(303, '/app');
  }
  const oidcConf = await getOAuthConfig();

  return {
    oidcConf: {
      // No need to pass everything
      enabled: oidcConf.enabled,
      providerName: oidcConf.providerName,
    },
  };
}) satisfies LayoutServerLoad;
