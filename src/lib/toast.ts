import { ToastUtils } from './toast-utils';
import { NormalizedApiError } from '@/types/api';

/** App-wide toast helpers built on the design-system toast. */
export const toast = {
  success: (title: string, description?: string) => ToastUtils.success({ title, description }),
  error: (title: string, description?: string) => ToastUtils.error({ title, description }),
  warning: (title: string, description?: string) => ToastUtils.warning({ title, description }),
};

/** Surface a thrown API error to the user using its normalized message. */
export function toastError(error: unknown, fallback = 'Something went wrong'): void {
  if (error instanceof NormalizedApiError) {
    toast.error(fallback, error.message);
    return;
  }
  const message = error instanceof Error ? error.message : fallback;
  toast.error(fallback, message);
}
