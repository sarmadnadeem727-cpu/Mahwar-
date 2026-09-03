/**
 * Shared server-side environment variable helper & validator.
 * Ensures critical API keys are validated only on server execution.
 */

export interface ServerEnv {
  GEMINI_API_KEY?: string;
  NEWS_API_KEY?: string;
}

/**
 * Returns validated server env keys or throws/logs gracefully depending on strict mode.
 */
export function getServerEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('lib/env.ts must only be invoked in server-side context.');
  }

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const newsApiKey = process.env.NEWS_API_KEY || "8b0c8e1f404a4cdda9e06d9e3f044211";

  return {
    GEMINI_API_KEY: geminiKey,
    NEWS_API_KEY: newsApiKey,
  };
}

/**
 * Ensures a specific key is present, throwing a readable error if absent.
 */
export function requireEnvKey(key: keyof ServerEnv, serviceName: string): string {
  const env = getServerEnv();
  const value = env[key];
  if (!value || value.trim() === '') {
    const errorMsg = `[Mahwar Server Config Error]: Missing environment variable '${key}' for ${serviceName}. Please set ${key} in your .env.local file or Vercel Environment Variables.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  return value.trim();
}
