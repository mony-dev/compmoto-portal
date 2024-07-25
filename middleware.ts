// import i18nRouter from 'next-i18n-router'
// import nextI18nextConfig from './next-i18next.config';
// export { default } from 'next-auth/middleware';

// export const config = { matcher: ['/admin'] };



import { i18nRouter } from 'next-i18n-router';
import i18nConfig from './i18nConfig';
import { default as authMiddleware } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export function middleware(request: any) {
  const i18nResult = i18nRouter(request, i18nConfig);
  if (i18nResult) return i18nResult;

  if (request.nextUrl.pathname.startsWith('/admin')) {
    return authMiddleware(request);
  }
 
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|static|.*\\..*|_next).*)', // i18n routes
    '/admin' // auth routes
  ]
};
