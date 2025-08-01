// biome-ignore lint/complexity/noBannedTypes: <empty object> is used for props with children
export type PropsWithChildren<T = {}> = T & {
	children?: React.ReactNode;
};

export interface PropsWithClassName extends PropsWithChildren {
	className?: string;
}
