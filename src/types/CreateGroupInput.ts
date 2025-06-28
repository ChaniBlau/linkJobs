import { Role } from "@prisma/client";
export interface CreateGroupInput {
  name: string;
  linkedinUrl: string;
  organizationId: number;
  userRole: Role;
}
