import type { Passkey, User, UUID } from '$lib/types';
import pool from '.';
import { Redis } from './caching';
import { PasskeyDAO } from './passkey';

export interface UserTable {
  id: UUID;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  totp_secret: string;
}
export class UserDAO {
  static convertToUser(row: UserTable, passkey: Passkey | null = null): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
      passkey: passkey,
      totpSecret: row.totp_secret,
    };
  }

  static async createUser(
    username: User['username'],
    email: User['email'],
    passwordHash: string
  ): Promise<User> {
    if (await UserDAO.userExists(username)) {
      throw new Error('errors.auth.usernameTaken');
    }
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [username, email, passwordHash]
    );
    if (result.rows.length === 0) {
      throw new Error('errors.auth.createUser');
    }
    return UserDAO.convertToUser(result.rows[0]);
  }

  static async userExists(username: User['username']): Promise<boolean> {
    const cachedValue = await Redis.get<boolean>(`userExists:${username}`);
    if (cachedValue) return cachedValue;
    const result = await pool.query('SELECT 1 FROM users WHERE username = $1', [username]);
    return result.rows.length > 0;
  }

  static async isEmailTaken(email: User['email']) {
    const cachedValue = await Redis.get<boolean>(`emailTaken:${email}`);
    if (cachedValue) return cachedValue;
    const result = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
    return result.rows.length > 0;
  }

  static async getUserById(id: User['id']): Promise<User> {
    const cachedUser = await Redis.get<User>(`user:${id}`);
    if (cachedUser) return cachedUser;

    const userResult = await pool.query<UserTable>('SELECT * FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      throw new Error('errors.auth.userNotFound');
    }
    const user = UserDAO.convertToUser(
      userResult.rows[0],
      await PasskeyDAO.getUserPasskey(userResult.rows[0].id)
    );
    await Redis.set(`user:${user.id}`, user);
    return user;
  }

  static async getUserByUsername(username: User['username']): Promise<User> {
    const cachedUser = await Redis.get<User>(`user:${username}`);
    if (cachedUser) return cachedUser;

    const userResult = await pool.query<UserTable>('SELECT * FROM users WHERE username = $1', [
      username,
    ]);
    if (userResult.rows.length === 0) {
      throw new Error('errors.auth.badUsername');
    }
    const user = UserDAO.convertToUser(
      userResult.rows[0],
      await PasskeyDAO.getUserPasskey(userResult.rows[0].id)
    );
    await Redis.set(`user:${username}`, user);
    return user;
  }

  static async credentialsExists(username: User['username'], email: User['email']) {
    const result = await pool.query<{ username: string; email: string }>(
      'SELECT username, email FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (result.rows.length !== 0) {
      const row = result.rows[0];
      const isUsernameTaken = row.username === username;
      if (isUsernameTaken) throw new Error('errors.auth.usernameTaken');
      throw new Error('errors.auth.emailInUse');
    }

    return false;
  }

  static async setTOTPSecret(userId: User['id'], secret: string): Promise<void> {
    const result = await pool.query('UPDATE users SET totp_secret = $1 WHERE id = $2', [
      secret,
      userId,
    ]);
    if (result.rowCount === 0) {
      throw new Error('errors.auth.setTOTPSecret');
    }
    await Redis.del(`user:${userId}`);
  }

  static async unlinkTOTP(userId: User['id']): Promise<void> {
    const result = await pool.query('UPDATE users SET totp_secret = NULL WHERE id = $1', [userId]);
    if (result.rowCount === 0) {
      throw new Error('errors.auth.unlinkTOTP');
    }
    await Redis.del(`user:${userId}`);
  }

  static async requestPasswordReset(email: User['email']): Promise<string> {
    const exists = await UserDAO.isEmailTaken(email);
    if (!exists) throw new Error('errors.auth.passwordReset.noAccountWithEmail');
    const id = crypto.randomUUID();
    await Redis.set(`passwordReset:${id}`, email, { ttl: 60 * 5 }); // 5 min expiry

    return id;
  }

  static async resetPassword(email: User['email'], hash: string) {
    await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, email]);
  }
}
