type ErrorFn = (...args: unknown[]) => unknown;

export const captureError = async <T>(
  callbackFn: () => Promise<T>,
  onError: ErrorFn,
): Promise<T> => {
  try {
    return await callbackFn();
  } catch (err) {
    if (err instanceof Error && err?.message) {
      onError(err.message, err.stack);
    }
    throw err;
  }
};
