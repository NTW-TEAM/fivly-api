import { SetMetadata } from '@nestjs/common';

export enum Scope {
  ROLES_MANAGE = 'roles:manage',
  UPDATE_USER = 'user:manage',
  SUPER_ADMIN = 'super:admin',
  ACTIVITIES_MANAGE = 'activities:manage',
  LOCALS_MANAGE = 'locals:manage',
  ASSEMBLIES_MANAGE = 'assemblies:manage',
}

export const SCOPES_KEY = 'scopes';
export const Scopes = (...scopes: Scope[]) => SetMetadata(SCOPES_KEY, scopes);