import { writable } from 'svelte/store';

export const value = writable<{ value: string | number | null; html: string | null }>({
  value: null,
  html: null,
});
export const minWidth = writable<number>(0);
