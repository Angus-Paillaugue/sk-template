import { isRoleAbove } from '$lib/roles';
import { urlStartsWith } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals, url }) => {
  if (
    locals.user &&
    urlStartsWith(url.pathname, '/app/admin') &&
    !isRoleAbove(locals.user.role, 'admin')
  ) {
    // If is trying to access any admin routes without an account or role
    redirect(303, '/app');
  }
}) satisfies LayoutServerLoad;
