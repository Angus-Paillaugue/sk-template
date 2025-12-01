import type { Dir } from '$lib/translations/i18n.svelte';
import type { User } from '$lib/types';
import type { FlagDecisions } from '$lib/flags/flags';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user?: User;
      i18n: {
        dir: Dir;
        lang: string;
      };
      flags?: FlagDecisions;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
