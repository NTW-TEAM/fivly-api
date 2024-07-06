import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '../../user/user.service'; // Assurez-vous d'importer correctement votre UserService
import { GedService } from '../ged.service'; // Assurez-vous d'importer correctement votre FileService
import { Access } from '../permission.entity';

@Injectable()
export class ManageAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
    private fileService: GedService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = await this.userService.findByEmail(request['user'].email);
    const path = request.body.path || request.params.path; // Assurez-vous que le chemin est bien passé dans la requête

    if (!user || !path) {
      throw new ForbiddenException('Missing user or path');
    }

    const access = await this.fileService.getRights(user, path);

    if (access !== Access.MANAGE) {
      throw new ForbiddenException(
        'You do not have manage access to this path',
      );
    }

    return true;
  }
}
