import { SetMetadata } from '@nestjs/common';

export enum Scope {
  ROLES_MANAGE = 'roles:manage',
  UPDATE_USER = 'user:update',
  SUPER_ADMIN = 'super:admin',
}

export const SCOPES_KEY = 'scopes';
export const Scopes = (...scopes: Scope[]) => SetMetadata(SCOPES_KEY, scopes);