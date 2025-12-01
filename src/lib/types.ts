import type { AuthenticatorTransportFuture, CredentialDeviceType } from '@simplewebauthn/browser';

export const roles = ['user', 'admin'] as const; // Keep the roles in order of power (used by `isRoleBelow` in `./roles/index.ts`)
export type Role = (typeof roles)[number];

export type UUID = string;
export interface User {
  id: UUID;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  totpSecret?: string;
  passkey: Passkey | null;
  role: Role;
  oauthProvider: string | null;
}

export interface Passkey {
  id: Base64URLString;
  publicKey: Uint8Array;
  webauthnUserID: Base64URLString;
  counter: number;
  deviceType: CredentialDeviceType;
  backedUp: boolean;
  transports?: AuthenticatorTransportFuture[];
}
