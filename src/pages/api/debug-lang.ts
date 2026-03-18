import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals, cookies }) => {
  return new Response(JSON.stringify({
    localsStyle: locals.languageStyle,
    cookieStyle: cookies.get('lemuria-language-style')?.value
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
