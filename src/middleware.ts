import { auth } from './lib/firebase-admin';
import { defineMiddleware } from 'astro:middleware';
import type { LanguageStyle } from './lib/i18n';

export const onRequest = defineMiddleware(async ({ cookies, redirect, url, locals }, next) => {
  // Restricted routes
  const isCreatorPage = url.pathname.startsWith('/creator-dashboard');
  const sessionCookie = cookies.get('__session')?.value;
  const languageStyleCookie = cookies.get('lemuria-language-style')?.value as LanguageStyle | undefined;

  // Set global language style
  locals.languageStyle = languageStyleCookie || 'fantasy';

  // Verify session globally if cookie exists
  if (sessionCookie) {
    try {
      if (auth) {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        locals.user = decodedClaims;
      }
    } catch (e) {
      console.warn('[Middleware] Global session verification failed:', e);
    }
  }

  if (isCreatorPage) {
    if (!locals.user) {
      return redirect('/login?reason=no-session');
    }

    // Admin access restriction
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || (import.meta as any).env?.ADMIN_EMAIL || 'johnlemargonzales@gmail.com';
    const isEmailVerified = (locals.user as any).email_verified;

    if (locals.user.email !== ADMIN_EMAIL || !isEmailVerified) {
      return redirect('/login?reason=non-admin');
    }
  }

  return next();
});
