
/**
 * Utility functions for object manipulation.
 * These functions provide methods to omit keys, add new keys, union objects,
 * and pick specific keys from an object.
 * 
 * @param obj - The source object.
 * @param keys - An array of keys to omit or pick.
 * @returns A new object with the specified keys omitted or picked.
 */
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> => {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
};

/**
 * Adds a new key-value pair to an object.
 * If the key already exists, it throws an error.
 * 
 * @param obj - The source object.
 * @param key - The key to add.
 * @param value - The value to add.
 * @returns A new object with the added key-value pair.
 */
export const add = <T extends Record<string, any>, K extends string, V>(
  obj: T,
  key: K extends string & keyof T ? never : K,
  value: V,
): Record<K, V> & T => {
  if (key in obj) {
    throw new Error(`Key "${key}" already exists in the object.`);
  }
  return { ...obj, [key]: value };
};

/**
 * Merges two objects into one.
 * If a key exists in both objects, it throws an error.
 *
 * @param obj1 - The first object.
 * @param obj2 - The second object.
 * @returns A new object that is the union of the two input objects.
 */
export const union = <
  T extends Record<string, any>,
  U extends Record<string, any>,
>(
  obj1: T,
  obj2: U,
): T & U => {
  const result = { ...obj1, ...obj2 };
  for (const key in obj1) {
    if (key in obj2) {
      throw new Error(`Key "${key}" exists in both objects.`);
    }
  }
  return result as T & U;
};

/**
 * Picks specific keys from an object.
 * If a key does not exist in the object, it is ignored.
 * This function returns a new object containing only the specified keys.
 *
 * @param obj - The source object.
 * @param keys - An array of keys to pick from the object.
 * @returns A new object containing only the specified keys.
 */
export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> => {
  const result: Partial<T> = {};
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result as Pick<T, K>;
};
