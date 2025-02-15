import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Scope, SCOPES_KEY } from './scope.decorator';
import { Scope as ScopeEntity } from '../scope/scope.entity';
import { UserService } from '../user/user.service';
import { ScopeService } from '../scope/scope.service';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class ScopesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
    private scopeService: ScopeService,
    private roleService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('CHECKING SCOPES');
    const request = context.switchToHttp().getRequest();
    const requiredScopes: Scope[] = this.reflector.getAllAndOverride<Scope[]>(
      SCOPES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredScopes) {
      console.log('NO SCOPES REQUIRED');
      return true;
    }
    const user = await this.userService.findByEmail(request['user'].email);
    if (!user) {
      console.log('NO USER FOUND');
      return false;
    }
    console.log('CHECKING IF USER HAS SCOPE');
    console.log(user.scopes);

    // Si un des scopes de l'utilisateur est SUPER_ADMIN, on autorise l'accès.
    if (user.scopes.some((scope) => scope.name === Scope.SUPER_ADMIN)) {
      console.log('USER IS SUPER ADMIN');
      return true;
    }

    let allUserScopes: ScopeEntity[] = user.scopes;
    // Récupérer les scopes des rôles de l'utilisateur

    console.log('USER ROLES :');
    console.log(user.roles);
    for (const role of user.roles) {
      console.log('GETTING SCOPES FOR ROLE', role.name);
      const roleEntity = await this.roleService.getRoleWithScopes(role.name);
      if (!roleEntity) {
        throw new Error('Role not found');
      }
      const roleScopes = roleEntity.scopes;
      console.log('SCOPES FOR ROLE', role.name);
      console.log(roleScopes);
      // si l'un des scopes du rôle est SUPER_ADMIN, on autorise l'accès.
      if (roleScopes.some((scope) => scope.name === Scope.SUPER_ADMIN)) {
        console.log('ROLE HAS SUPER ADMIN SCOPE');
        return true;
      }
      allUserScopes = allUserScopes.concat(roleScopes);
    }
    console.log('ALL USER SCOPES :');
    console.log(allUserScopes);
    if (!allUserScopes || allUserScopes.length === 0) {
      console.log('USER HAS NO SCOPES');
      return false;
    }
    console.log('REQUIRED SCOPES :');
    console.log(requiredScopes);
    // Convertir les scopes de l'utilisateur en un ensemble de noms (ou IDs) de scope pour une comparaison facile.
    const userScopesSet = new Set(allUserScopes.map((scope) => scope.name)); // Ajustez 'scope.name' selon votre modèle.

    // Vérifier que tous les scopes requis sont présents dans l'ensemble des scopes de l'utilisateur.
    return requiredScopes.every((scope) => userScopesSet.has(scope));
  }
}
