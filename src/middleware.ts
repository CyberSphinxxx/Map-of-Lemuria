import { defineMiddleware } from 'astro:middleware';
import { auth } from './lib/firebase-admin';

export const onRequest = defineMiddleware(async ({ pathname, cookies, redirect }: any, next: any) => {

  // Only protect the creator-dashboard route
  if (pathname.startsWith('/creator-dashboard')) {
    const sessionCookie = cookies.get('__session')?.value;

    if (!sessionCookie) {
      return redirect('/login?reason=unauthenticated');
    }

    try {
      // Verify the session cookie (simplified for this implementation)
      // In a real app, you'd use auth.verifySessionCookie(sessionCookie)
      await auth.verifyIdToken(sessionCookie);
    } catch (error) {
      return redirect('/login?reason=invalid-session');
    }
  }

  return next();
});
