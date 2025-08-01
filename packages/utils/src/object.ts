/** biome-ignore-all lint/suspicious/noExplicitAny: <any> */
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
