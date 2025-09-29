// A utility function to wrap callbacks and handle errors in a standardized way.
export const create_callback =
  async <
    E extends Error,
    T extends (...args: any[]) => Promise<any> | any = (...args: any[]) => any,
    IsAwaited = T extends (...args: any[]) => Promise<any> ? true : false,
  >(callback: T, ...args: Parameters<T>): Promise<[
    E | null,
    IsAwaited extends true ? Awaited<ReturnType<T>> : ReturnType<T> | null
  ]> => {
    const temp_promise = new Promise<ReturnType<T>>((resolve, reject) => {
      try {
        const result = callback(...args);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

    if (temp_promise instanceof Promise) {
      try {
        const result = await temp_promise;
        return [null, result];
      } catch (error) {
        if (error instanceof Error) {
          return [error as E, null as any];
        } else {
          return [new Error(`Unknown error: from ${callback.name} with args ${JSON.stringify(args)} have an error => ${error}`) as E, null as any];
        }
      }
    }

    // This should never be reached, but TypeScript requires a return statement
    return [null, null] as any;
  }
