import type { User } from '../auth';
import { writable } from 'svelte/store';

export const MePageUserStore = writable<User | null>(null);
