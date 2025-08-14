import { UserDAO } from '$lib/server/db/user';
import bcrypt from 'bcryptjs';
import type { Actions } from './$types';
import { generateAccessToken } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { logger } from '$lib/utils/logger';

export const actions: Actions = {
  signUp: async ({ request, cookies }) => {
    const formData = Object.fromEntries(await request.formData()) as Record<
      string,
      string | undefined
    >;
    const { username, email, password } = formData as {
      username: string;
      password: string;
      email: string;
    };
    const rememberMe = formData.rememberMe === 'on';
    try {
      await UserDAO.credentialsExists(username, email);
    } catch (error) {
      logger.error('Error creating user account :', error);
      return fail(400, {
        action: 'signUp',
        error:
          error instanceof Error
            ? error.message || 'errors.server.connectionRefused'
            : String(error),
      });
    }

    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      const createdUser = await UserDAO.createUser(username, email, hash);
      cookies.set('token', generateAccessToken(createdUser.id), {
        path: '/',
        maxAge: rememberMe ? 60 * 60 * 24 * 30 : undefined, // 30 days if rememberMe is true
      });
    } catch (error) {
      logger.error('Error creating user account :', error);
      return fail(400, {
        action: 'signUp',
        error:
          error instanceof Error
            ? error.message || 'errors.server.connectionRefused'
            : String(error),
      });
    }

    redirect(303, '/app');
  },
};
