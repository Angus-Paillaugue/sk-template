import type { AuthenticatorTransportFuture, CredentialDeviceType } from '@simplewebauthn/browser';

export type UUID = string;
export interface User {
  id: UUID;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  totpSecret?: string;
  passkey: Passkey | null;
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
