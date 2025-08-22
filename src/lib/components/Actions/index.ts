import Actions from './actions.svelte';
import { writable } from 'svelte/store';

export interface Action {
  text: string;
  onclick?: () => void;
  icon?: any;
}

const actions = writable<Action[]>([]);

export { Actions };

export default actions;
