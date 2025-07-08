import { Role } from "@prisma/client";
export interface CreateGroupInput {
  name: string;
  linkedinUrl: string;
  userRole: Role;
}
