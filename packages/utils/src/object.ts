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

export const append = <T extends Record<string, any>, K extends string, V>(
	obj: T,
	key: K extends string & keyof T ? never : K,
	value: V,
): Record<K, V> & T => {
	if (key in obj) {
		throw new Error(`Key "${key}" already exists in the object.`);
	}
	return { ...obj, [key]: value };
};
