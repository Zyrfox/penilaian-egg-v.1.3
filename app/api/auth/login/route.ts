import { validateLoginCredentials } from '@/lib/utils/validators';
import { VALID_CREDENTIALS, MANAGERS } from '@/lib/utils/constants';
import { signToken } from '@/lib/api/auth';
import { NextRequest, NextResponse } from 'next/server';
import { User, UserRole } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const validationErrors = validateLoginCredentials(username, password);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, message: validationErrors[0].message },
        { status: 401 }
      );
    }

    const role: UserRole = MANAGERS.includes(username) ? 'manager' : 'supervisor';
    // MGRs typically have access to everything, SPVs are linked to their outlet which is the first part of their ID
    const outlet = username.split('-')[0];

    // Build the user model
    const user: User = {
      id: username,
      name: username, // Would ideally be fetched from Master List in a real implementation
      role,
      outlet,
      loginTime: new Date().toISOString()
    };

    // Sign the JWT
    const token = await signToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      outlet: user.outlet,
      loginTime: user.loginTime
    });

    // Create the response
    const response = NextResponse.json(
      { success: true, user, token },
      { status: 200 }
    );

    // Set HTTP Only Cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server. Coba lagi.' },
      { status: 500 }
    );
  }
}
