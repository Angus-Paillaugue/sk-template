import { page } from '$app/state';
import { Settings, User } from '@lucide/svelte';
import { createLogger } from './logger';

type Route = string | string[];

export interface Action {
  route: Route;
  text: string;
  onclick?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
  href?: string;
}

const actionsLogger = createLogger('[page actions]:', '#03A9F4');

// const isLoggedIn = $derived(page.data.user !== undefined);

const specialSymbols = {
  none: 'none',
  all: '*',
};

const negate = (r: string): string => {
  if (r === specialSymbols.none) return specialSymbols.all;
  if (r === specialSymbols.all) return specialSymbols.none;

  return '!' + r;
};

export const routes = {
  app: '/app',
  account: '/app/account',
  settings: '/app/account/settings',
  home: '/',
  login: '/auth/log-in',
  signup: '/auth/sign-up',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/forgot-password/reset',
  all: specialSymbols.all,
  none: specialSymbols.none,
  notApp: negate('/app*'),
};

const matchesPattern = (pattern: string, path: string): boolean => {
  const p = pattern.startsWith('!') ? pattern.slice(1) : pattern;
  if (p === routes.none) return false;
  if (p === routes.all) return true;

  if (p.endsWith('*')) {
    const base = p.slice(0, -1);
    return path.startsWith(base);
  }

  return p === path;
};

const isActionApplicable = (action: Action, path: string): boolean => {
  const { route } = action;
  if (route === routes.none) return false;
  if (route === routes.all) return true;

  if (Array.isArray(route)) {
    // any explicit negation (including wildcard negations) for the current path should block the action
    if (route.some((r) => r.startsWith('!') && matchesPattern(r, path))) return false;
    // otherwise the action is applicable if any non-negated entry matches (including wildcard matches)
    return route.some((r) => !r.startsWith('!') && matchesPattern(r, path));
  }

  return matchesPattern(route, path);
};

const pageActions: Action[] = $derived([
  {
    route: [routes.app, routes.settings],
    text: 'Account',
    icon: User,
    href: routes.account,
  },
  {
    route: [routes.app, routes.account],
    text: 'Settings',
    icon: Settings,
    href: routes.settings,
  },
]);

export function getPageActions() {
  const path = page.route.id || '/';
  actionsLogger.debug('Current path:', path);
  // actionsLogger.debug('User logged in:', isLoggedIn);
  return pageActions.filter((a) => isActionApplicable(a, path));
}
