/** Role enum */
export enum Role {
  Staff = 'staff',
  Student = 'student',
  Rejected = 'rejected',
}

/** Staff email pattern */
export const staff_email_pattern = /^[\w-.]+@(itm).kmutnb\.ac\.th$/;
/** Student email pattern */
export const student_email_pattern = /^s\d{2}0602\d{7}@email\.kmutnb\.ac\.th$/;
/** Student ID pattern */
export const student_id_pattern = /\d{2}0602\d{7}$/;

/**
 * Role validator with email
 * @param email - email to validate
 * @returns Role
 */
export const role_validator = (email: string): Role => {
  if (staff_email_pattern.test(email)) return Role.Staff;
  else if (student_email_pattern.test(email)) return Role.Student;
  else return Role.Rejected;
}

/**
 * Check if the role is staff
 * @param role - role to check
 * @returns true if the role is staff, false otherwise
 */
export const is_staff = (role: Role) => role === Role.Staff;

/**
 * Check if the role is student
 * @param role - role to check
 * @returns true if the role is student, false otherwise
 */
export const is_student = (role: Role) => role === Role.Student;
