import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const secretKey = process.env.JWT_SECRET || 'default-secret-key';
const key = new TextEncoder().encode(secretKey);

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
}

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ['HS256'],
    });
    return payload;
}

export async function login(user: { id: string | number; username: string; role: string }) {
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    const session = await encrypt({ user, expires });

    const cookieStore = await cookies();
    cookieStore.set('gearguard_auth_cipher', session, { expires, httpOnly: true });
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.set('gearguard_auth_cipher', '', { expires: new Date(0) });
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get('gearguard_auth_cipher')?.value;
    if (!session) return null;
    return await decrypt(session);
}
