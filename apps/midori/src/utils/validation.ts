import { student_id_pattern } from "auth/utils/role";

export const studentValidationFromId = (student_id: string): boolean => {
  if (student_id.startsWith("s") && student_id.length <= 14) {
    student_id = student_id.slice(1); // Remove leading 's'
  } else if (student_id.length > 13) {
    return false; // Invalid length for student ID
  }

  return student_id_pattern.test(student_id);
};