// AsyncWrapper.ts
type AsyncFunction<T> = (...args: any[]) => Promise<T>;

export async function wrapAsync<T>(
  fn: AsyncFunction<T>,
  ...args: Parameters<typeof fn>
): Promise<[Error | null, T | null]> {
  try {
    const data = await fn(...args);
    return [null, data];
  } catch (err) {
    return [err as Error, null];
  }
}
