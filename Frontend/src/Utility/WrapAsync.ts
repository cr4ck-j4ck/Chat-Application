// AsyncWrapper.ts
type AsyncFunction<T> = (...args: unknown[]) => Promise<T>;

export async function wrapAsync<T>(
  fn: AsyncFunction<T>,
  ...args: unknown[]
): Promise<[Error | null, T | null]> {
  try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await fn(...(args as any));
    return [null, data];
  } catch (err) {
    return [err instanceof Error ? err : new Error(String(err)), null];
  }
}
