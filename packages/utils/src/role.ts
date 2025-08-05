export enum Role {
	Staff = "Staff",
	Student = "Student",
	External = "External",
}

export const getRoleFromEmail = (email: string): Role => {
	if (email.match(/^[\w-.]+@(itm|fitm).kmutnb\.ac\.th$/)) {
		return Role.Staff;
	} else if (email.match(/^s\d{2}0602\d{7}@email\.kmutnb\.ac\.th$/)) {
		return Role.Student;
	} else {
		return Role.External;
	}
};

export const studentValidationFromId = (studentId: string): boolean => {
	if (studentId.startsWith("s")) {
		studentId = studentId.slice(1); // Remove leading 's'
	}
	const regex = /\d{2}0602\d{7}$/;
	return regex.test(studentId);
};
