export type Role = "admin" | "student" | "external";

export const getRoleFromEmail = (email: string): Role => {
	if (email.match(/^[\w-.]+@(itm|fitm).kmutnb\.ac\.th$/)) {
		return "admin";
	} else if (email.match(/^s\d{2}0602\d{7}@email\.kmutnb\.ac\.th$/)) {
		return "student";
	} else {
		return "external";
	}
};
