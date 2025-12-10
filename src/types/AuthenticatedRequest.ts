import { Request } from 'express';
import { Role, Organization } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: Role;
    organizationId: number | null; 
  };
  organization?: Organization;
  hasActiveLicense?: boolean;
}

