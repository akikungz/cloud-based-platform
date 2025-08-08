/** Staff email pattern */
export const staff_email_pattern = /^[\w-.]+@(itm|fitm).kmutnb\.ac\.th$/;
/** Student email pattern */
export const student_email_pattern = /^s\d{2}0602\d{7}@email\.kmutnb\.ac\.th$/;
/** Student ID pattern */
export const student_id_pattern = /\d{2}0602\d{7}$/;

/**
 * Role management utilities.
 * This module provides functionality to determine user roles based on email patterns
 * and validate student IDs.
 */
export enum Role {
	Administrator = "Administrator",
	Teacher = "Teacher",
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
	if (email.match(staff_email_pattern)) {
		return Role.Staff;
	} else if (email.match(student_email_pattern)) {
		return Role.Student;
	} else {
		return Role.External;
	}
};

/**
 * Validates a student ID.
 * The student ID should start with 's' followed by a specific pattern.
 * @param student_id - The student ID to validate.
 * @returns True if the student ID is valid, false otherwise.
 */
export const studentValidationFromId = (student_id: string): boolean => {
	if (student_id.startsWith("s") && student_id.length <= 14) {
		student_id = student_id.slice(1); // Remove leading 's'
	} else if (student_id.length > 13) {
		return false; // Invalid length for student ID
	}

	return student_id_pattern.test(student_id);
};
