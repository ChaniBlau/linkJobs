export type CreateUserByAdminInput = {
  name: string;
  email: string;
  password: string;
  organizationId: number | null; 
};