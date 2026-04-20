import { SignJWT, jwtVerify } from 'jose';
import { JWT_CONFIG } from '../utils/constants';
import { AuthToken } from '../types';

const getSecretKey = () => {
  return new TextEncoder().encode(JWT_CONFIG.SECRET);
};

export async function signToken(payload: any): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_CONFIG.EXPIRY)
    .sign(getSecretKey());
}

export async function verifyToken(token: string): Promise<AuthToken | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as AuthToken;
  } catch (error) {
    return null;
  }
}
