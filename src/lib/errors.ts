import axios from 'axios';

export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ error?: unknown }>(error)) {
    const message = error.response?.data?.error;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return error instanceof Error && error.message ? error.message : fallback;
}
