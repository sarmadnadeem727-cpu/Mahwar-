import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * auth.ts — Auth.js v5 configuration.
 *
 * Google is the only identity provider. Sessions are stateless JWTs signed with
 * AUTH_SECRET, so no database is required; the terminal stays "no backend state".
 *
 * When AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET are missing the provider list is
 * empty and `isAuthConfigured()` returns false — the middleware then lets the
 * terminal run in guest mode instead of hard-failing.
 */
export const isAuthConfigured = () => !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET && process.env.AUTH_SECRET);

/** Comma-separated allow-list of e-mail domains (optional). */
const allowedDomains = (process.env.AUTH_ALLOWED_DOMAINS || "")
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

export const authConfig: NextAuthConfig = {
  providers: isAuthConfigured()
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID,
          clientSecret: process.env.AUTH_GOOGLE_SECRET,
          authorization: { params: { prompt: "select_account", access_type: "online", scope: "openid email profile" } },
        }),
      ]
    : [],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7 days
  pages: { signIn: "/login", error: "/login" },
  trustHost: true,
  callbacks: {
    signIn({ profile }) {
      if (allowedDomains.length === 0) return true;
      const email = (profile?.email || "").toLowerCase();
      return allowedDomains.some((d) => email.endsWith(`@${d}`));
    },
    jwt({ token, profile }) {
      if (profile) {
        token.name = profile.name;
        token.email = profile.email;
        token.picture = (profile as { picture?: string }).picture;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email;
        session.user.image = (token.picture as string | undefined) ?? session.user.image;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-mahwar.session" : "mahwar.session",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" },
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
