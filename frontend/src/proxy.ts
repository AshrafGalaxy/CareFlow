import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all routes except Next.js internals and static files
  matcher: [
    // Enable locale detection for all routes except api, _next, and static files
    '/((?!api|_next/static|_next/image|favicon.ico|sw\\.js|.*\\.svg$|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.webp$).*)',
    // Always run for root
    '/'
  ]
};
