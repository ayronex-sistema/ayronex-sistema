export type BasicAuthCredentials = {
  email: string;
  password: string;
} | null;

export function isChecklistPublicMode() {
  return process.env.CHECKLIST_PUBLIC_MODE === "true";
}

export function decodeBasicAuth(headerValue: string | null): BasicAuthCredentials {
  if (!headerValue?.startsWith("Basic ")) {
    return null;
  }

  try {
    const encoded = headerValue.slice("Basic ".length);
    const decoded = atob(encoded);
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex < 0) {
      return null;
    }

    return {
      email: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1)
    };
  } catch {
    return null;
  }
}

export function isBasicAuthValid(headerValue: string | null) {
  if (isChecklistPublicMode()) {
    return true;
  }

  const expectedEmail = process.env.FISCAL_USER_EMAIL;
  const expectedPassword = process.env.FISCAL_USER_PASSWORD;

  if (!expectedEmail || !expectedPassword) {
    return false;
  }

  const credentials = decodeBasicAuth(headerValue);
  if (!credentials) {
    return false;
  }

  return credentials.email === expectedEmail && credentials.password === expectedPassword;
}
