import { PasskeyDAO } from '$lib/server/db/passkey';
import { UserDAO } from '$lib/server/db/user';
import { validateTOTP } from '$lib/server/totp';
import type { User } from '$lib/types';
import { fail, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
  deletePasskey: async ({ locals }) => {
    const user = locals.user as User;

    try {
      await PasskeyDAO.deletePasskey(user.id);
      user.passkey = null;
      return { success: true, message: 'successes.passkeyDeleted', action: 'deletePasskey' };
    } catch (error) {
      console.error('Error deleting passkey:', error);
      return fail(500, {
        error: true,
        message: 'errors.auth.passkeyDeletionFailed',
        action: 'deletePasskey',
      });
    }
  },
  unlinkTOTP: async({ locals, request }) => {
    const user = locals.user as User;
    const formData = Object.fromEntries(await request.formData());
    const { totp } = formData as {
      totp: string;
    };

    try {
      if (!user.totpSecret) throw new Error('errors.auth.totp.notEnabled');
      const success = await validateTOTP(user.totpSecret, totp);
      if (!success) throw new Error('errors.auth.totp.invalidCode');
      await UserDAO.unlinkTOTP(user.id);
      return { success: true, message: 'successes.unlinkTOTP', action: 'unlinkTOTP' };
    } catch (error) {
      return fail(500, {
        action: 'unlinkTOTP',
        error: true,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  },
  setUpTOTP: async({ locals, request }) => {
    const user = locals.user as User;
    const formData = Object.fromEntries(await request.formData());
    const { totp, TOTPsecret } = formData as {
      totp: string;
      TOTPsecret: string;
    };

    try {
      const success = await validateTOTP(TOTPsecret, totp);
      if (!success) throw new Error('errors.auth.totp.invalidCode');
      await UserDAO.setTOTPSecret(user.id, TOTPsecret);
      return { success: true, message: 'successes.setUpTOTP', action: 'setUpTOTP' };
    } catch (error) {
      return fail(500, {
        action: 'setUpTOTP',
        error: true,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  },
};
