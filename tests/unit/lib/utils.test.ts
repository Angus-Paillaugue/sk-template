import { describe, it, expect, vi } from 'vitest';
import { cn, noop, urlStartsWith } from '$lib/utils';

vi.mock('svelte/reactivity', () => {
  return {
    MediaQuery: class {
      query: string;
      current = false;
      constructor(query: string) {
        this.query = query;
      }
    },
  };
});

describe('utils', () => {
  describe('cn', () => {
    it('merges tailwind classes correctly', () => {
      expect(cn('p-2', 'p-4')).toBe('p-4');
    });

    it('handles conditional classes objects', () => {
      expect(cn('p-2', { 'm-2': true, 'm-4': false })).toBe('p-2 m-2');
    });

    it('handles arrays and mixed inputs', () => {
      expect(cn(['text-red-500', 'bg-blue-500'], 'p-1')).toBe('text-red-500 bg-blue-500 p-1');
    });

    it('filters out falsy values', () => {
      expect(cn('relative', undefined, null, false, 'w-full')).toBe('relative w-full');
    });
  });

  describe('noop', () => {
    it('returns undefined and accepts arguments', () => {
      expect(noop()).toBeUndefined();
      expect(noop(1, 'a', {})).toBeUndefined();
    });
  });

  describe('urlStartsWith', () => {
    it('returns true if url starts with string path', () => {
      expect(urlStartsWith('/dashboard/user', '/dashboard')).toBe(true);
    });

    it('returns false if url does not start with string path', () => {
      expect(urlStartsWith('/settings', '/dashboard')).toBe(false);
    });

    it('handles RegExp paths', () => {
      expect(urlStartsWith('/api/v1/users', /\/api\/v\d\//)).toBe(true);
      expect(urlStartsWith('/dashboard', /\/api\//)).toBe(false);
    });

    it('handles Array of paths (OR condition)', () => {
      const reg = /\/auth\//;
      // FIX: Ensure the regex is actually IN the array
      const paths = ['/home', '/admin', reg];

      expect(urlStartsWith('/admin/settings', paths)).toBe(true);
      expect(urlStartsWith('/auth/login', paths)).toBe(true);
      expect(urlStartsWith('/about', reg)).toBe(false);
    });

    it('returns true for single character paths (e.g. root "/")', () => {
      expect(urlStartsWith('/any/url/here', '/')).toBe(true);
    });
  });
});
