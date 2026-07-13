import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Защищаем только маршрут /admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization');
    
    // Задайте логин и пароль здесь (лучше вынести в .env, но пока оставим хардкод для надежности)
    const ADMIN_USER = process.env.ADMIN_USER || 'admin';
    const ADMIN_PASS = process.env.ADMIN_PASS || '82agencybot';

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      if (user === ADMIN_USER && pwd === ADMIN_PASS) {
        return NextResponse.next();
      }
    }

    return new NextResponse('Auth required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Admin Area"',
      },
    });
  }
}

export const config = {
  matcher: '/admin/:path*',
};
