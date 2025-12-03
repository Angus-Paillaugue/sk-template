import { isRoleAbove } from '$lib/roles';
import { urlStartsWith } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { FlagDAO } from '$lib/server/db/flag';

export const load = (async ({ locals, url }) => {
  if (
    locals.user &&
    urlStartsWith(url.pathname, '/app/admin') &&
    !isRoleAbove(locals.user.role, 'admin')
  ) {
    // If is trying to access any admin routes without an account or role
    redirect(303, '/app');
  }
  const f = await FlagDAO.getAllFlags();
  // Remove decide function before sending to client
  const flags = f.map((flag) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { decide, ...rest } = flag;
    return rest;
  });

  return { adminFlags: flags };
}) satisfies LayoutServerLoad;
