/**
 * Shared server-side environment variable helper & validator.
 * Ensures critical API keys are validated only on server execution.
 */

export interface ServerEnv {
  MARKETAUX_API_KEY?: string;
  FINLIGHT_API_KEY?: string;
  NEXT_PUBLIC_APP_URL?: string;
}

/**
 * Returns validated server env keys or throws/logs gracefully depending on strict mode.
 */
export function getServerEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('lib/env.ts must only be invoked in server-side context.');
  }

  return {
    MARKETAUX_API_KEY: process.env.MARKETAUX_API_KEY || "",
    FINLIGHT_API_KEY: process.env.FINLIGHT_API_KEY || "",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "https://mahwar.vercel.app",
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
