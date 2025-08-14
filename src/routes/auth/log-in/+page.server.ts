import { UserDAO } from '$lib/server/db/user';
import bcrypt from 'bcryptjs';
import type { Actions } from './$types';
import { generateAccessToken } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { logger } from '$lib/utils/logger';
import { validateTOTP } from '$lib/server/totp';

export const actions: Actions = {
  logIn: async ({ request, cookies }) => {
    const formData = Object.fromEntries(await request.formData()) as Record<
      string,
      string | undefined
    >;
    const { username, password, totpCode } = formData as {
      username: string;
      password: string;
      totpCode: string | undefined;
    };
    const rememberMe = formData.rememberMe === 'on';

    try {
      const user = await UserDAO.getUserByUsername(username);
      const compare = await bcrypt.compare(password, user.passwordHash);

      if (!compare) {
        throw new Error('errors.auth.invalidCredentials');
      }

      if (user.totpSecret) {
        if (!totpCode) {
          return fail(400, {
            action: 'logIn',
            error: true,
            noTOTPCode: true,
          });
        }

        const result = await validateTOTP(user.totpSecret, totpCode);
        if (!result) {
          throw new Error('errors.auth.totp.invalidCode');
        }
      }

      cookies.set('token', generateAccessToken(user.id), {
        path: '/',
        maxAge: rememberMe ? 60 * 60 * 24 * 30 : undefined, // 30 days if rememberMe is true
      });
    } catch (error) {
      logger.error('Error logging user :', error);
      return fail(400, {
        action: 'logIn',
        error: true,
        message:
          error instanceof Error
            ? (error.message || 'errors.server.connectionRefused')
            : String(error),
      });
    }
    redirect(303, '/app');
  }
};
