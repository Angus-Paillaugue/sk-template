import { json } from '@sveltejs/kit';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { RequestHandler } from './$types';
import { Caching } from '$lib/server/db/caching';
import { PasskeyDAO } from '$lib/server/db/passkey';
import { rpID, origin } from '$lib/server/db/passkey';
import { generateAccessToken } from '$lib/server/auth';
import { getCookiePrefix } from '$lib/server/utils';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { authResp, UUID } = await request.json();

  const storedChallenge = await Caching.get<string>(`authenticationChallenge:${UUID}`);
  if (!storedChallenge) {
    return json({ error: 'errors.auth.challengeExpired' }, { status: 400 });
  }

  const passkey = await PasskeyDAO.getPasskeyByCredentialID(authResp.id);
  if (!passkey) {
    throw new Error('No authenticator found for this credential ID');
  }

  const verification = await verifyAuthenticationResponse({
    response: authResp,
    expectedChallenge: storedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: passkey,
  });

  if (verification.verified) {
    const credentialId = authResp.id;
    const user = await PasskeyDAO.getUserByCredentialID(credentialId);
    await Caching.del(`authenticationChallenge:${UUID}`);
    if (!user) {
      return json({ verified: false, error: 'errors.auth.noPasskey' }, { status: 400 });
    }
    cookies.set(getCookiePrefix('token'), generateAccessToken(user.id), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return json({ verified: true, user });
  }

  return json({ verified: false, error: 'errors.auth.verificationFailed' }, { status: 400 });
};
