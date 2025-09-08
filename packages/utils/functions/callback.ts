export const create_callback =
  async <E, T>(
    callback: () => T | Promise<T>,
  ): Promise<[E | null, T | null]> => {
    try {
      const result = await callback();
      return [null, result] as [E | null, T | null];
    } catch (error) {
      return [error as E, null];
    }
  }
