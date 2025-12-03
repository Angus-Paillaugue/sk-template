import { page } from '$app/state';

interface RequiredCookie {
  required: true;
}

interface OptionalCookie {
  required: false;
  accepted: boolean;
}

export type Cookie = RequiredCookie | OptionalCookie;

export type CookieConsent = Record<string, boolean> | 'pending';

class Cookies {
  // Declare all cookies used in the application here
  // Please remember to update the translations at `cookies.moreInfo.cookies`
  COOKIES: Record<string, Cookie> = {
    token: {
      required: true,
    },
    locale: {
      required: true,
    },
    flag_id: {
      required: true,
    },
    cookie_consent: {
      required: true,
    },
  };

  hasNonEssentialCookies(): boolean {
    for (const cookie of Object.values(this.COOKIES)) {
      if (!cookie.required) {
        return true;
      }
    }
    return false;
  }

  getCookieConsent<T extends boolean>(
    allowPending: T
  ): T extends true ? CookieConsent : Record<string, boolean> {
    if (page.data.cookieConsent === 'pending' && allowPending) {
      // @ts-expect-error: TypeScript can't infer conditional return type at runtime
      return 'pending';
    }

    const consent: Record<string, boolean> = {};
    for (const [key, cookie] of Object.entries(this.COOKIES)) {
      if (cookie.required) {
        consent[key] = true;
      } else {
        consent[key] = page.data.cookieConsent?.[key] ?? cookie.accepted;
      }
    }
    return consent;
  }

  setCookieConsent(consent: CookieConsent) {
    fetch('/api/cookieConsent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consent),
    });
  }

  acceptAllCookies() {
    const consent: CookieConsent = {};
    for (const [key] of Object.entries(this.COOKIES)) {
      consent[key] = true;
    }
    this.setCookieConsent(consent);
    return consent;
  }
}

export const COOKIES = new Cookies();
