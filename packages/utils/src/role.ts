/**
 * Role management utilities.
 * This module provides functionality to determine user roles based on email patterns
 * and validate student IDs.
 */
export enum Role {
	Staff = "Staff",
	Student = "Student",
	External = "External",
}

/**
 * Determines the role of a user based on their email address.
 * @param email - The email address of the user.
 * @returns The role of the user as a Role enum value.
 */
export const getRoleFromEmail = (email: string): Role => {
	if (email.match(/^[\w-.]+@(itm|fitm).kmutnb\.ac\.th$/)) {
		return Role.Staff;
	} else if (email.match(/^s\d{2}0602\d{7}@email\.kmutnb\.ac\.th$/)) {
		return Role.Student;
	} else {
		return Role.External;
	}
};

/**
 * Validates a student ID.
 * The student ID should start with 's' followed by a specific pattern.
 * @param studentId - The student ID to validate.
 * @returns True if the student ID is valid, false otherwise.
 */
export const studentValidationFromId = (studentId: string): boolean => {
	if (studentId.startsWith("s")) {
		studentId = studentId.slice(1); // Remove leading 's'
	}
	const regex = /\d{2}0602\d{7}$/;
	return regex.test(studentId);
};
