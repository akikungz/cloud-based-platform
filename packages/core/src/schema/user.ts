export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface Staff {
  id: string;
  auth_id: User["id"];
}