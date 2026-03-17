import { auth } from './lib/firebase-admin';
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async ({ cookies, redirect, url, locals }, next) => {
  // Restricted routes
  const isCreatorPage = url.pathname.startsWith('/creator-dashboard');
  const sessionCookie = cookies.get('__session')?.value;

  if (isCreatorPage) {
    if (!sessionCookie) {
      return redirect('/login?reason=no-session');
    }

    try {
      const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
      locals.user = decodedClaims;
      return next();
    } catch (e) {
      console.error('[Middleware] Session verification failed:', e);
      return redirect('/login?reason=invalid-session');
    }
  }

  // Public routes
  return next();
});
