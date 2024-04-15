import { SetMetadata } from '@nestjs/common';

export enum Scope {
  ROLES_CREATE = 'roles:create',
  ROLES_DELETE = 'roles:delete',
  UPDATE_USER = 'user:update',
}

export const SCOPES_KEY = 'scopes';
export const Scopes = (...scopes: Scope[]) => SetMetadata(SCOPES_KEY, scopes);