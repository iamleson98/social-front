import { writable, derived } from 'svelte/store';
import { randomID } from '$lib/utils/utils';
import type { SocialVariant } from '$lib/utils';


export type ToastProps = {
  id: string;
  message: string;
  variant: SocialVariant;
  /**
   * default to 3000ms
   */
  timeout?: number;
};


function createNotificationStore() {
  const _notifications = writable<ToastProps[]>([]);

  async function send({ timeout = 3000, ...rest }: Omit<ToastProps, 'id'>) {
    _notifications.update((toasts) => {
      return toasts.concat({
        id: randomID(),
        timeout,
        ...rest,
      });
    });
  }

  const { subscribe } = derived(_notifications, ($_notifications: ToastProps[], set: (value: ToastProps[]) => void) => {
    set($_notifications);

    if ($_notifications.length) {
      const timer = setTimeout(() => {
        _notifications.update((toasts) => {
          toasts.shift();
          return toasts;
        })
      }, $_notifications[0].timeout);

      return () => clearTimeout(timer);
    }
  });

  return {
    subscribe,
    send,
  };
}

export const toastStore = createNotificationStore();
