import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const cookies = request.cookies.getAll();
  const authCookies = cookies.filter(c => c.name.includes('supabase') || c.name.includes('sb-'));

  let sessionResult: unknown = null;
  let userResult: unknown = null;
  let claimsResult: unknown = null;

  try {
    const supabase = await createClient();

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    sessionResult = {
      hasSession: !!sessionData?.session,
      userId: sessionData?.session?.user?.id ?? null,
      expiresAt: sessionData?.session?.expires_at ?? null,
      error: sessionError ? { message: sessionError.message, code: (sessionError as any).code } : null,
    };

    const { data: userData, error: userError } = await supabase.auth.getUser();
    userResult = {
      userId: userData?.user?.id ?? null,
      email: userData?.user?.email ?? null,
      error: userError ? { message: userError.message, code: (userError as any).code } : null,
    };

    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
    claimsResult = {
      hasClaims: !!claimsData?.claims,
      sub: (claimsData?.claims as any)?.sub ?? null,
      error: claimsError ? { message: claimsError.message } : null,
    };
  } catch (e: unknown) {
    sessionResult = { threw: String(e) };
  }

  return NextResponse.json({
    allCookieCount: cookies.length,
    authCookieNames: authCookies.map(c => c.name),
    session: sessionResult,
    user: userResult,
    claims: claimsResult,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20) + '...',
  });
}
