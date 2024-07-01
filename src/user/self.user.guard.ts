import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ScopeService } from '../scope/scope.service';
import { UserService } from './user.service';
import { Scope } from '../authorization/scope.decorator';

@Injectable()
export class SelfUserGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const isAdministrator: boolean = await this.userService.hasScope(
      request['user'].id,
      Scope.SUPER_ADMIN,
    );

    if (isAdministrator) {
      return true;
    }

    // check if the user has the scope to update another user
    const hasScope: boolean = await this.userService.hasScope(
      request['user'].id,
      Scope.UPDATE_USER,
    );

    if (hasScope) {
      return true;
    }

    console.log('{{{{{{LOGGING USER ID}}}}}}');
    console.log(request['user'].id);
    console.log(request.params.userId);
    console.log('{{{{{{END OF LOGGING USER ID}}}}}}');
    if (request['user'].id != request.params.userId) {
      console.log('{{{{{{NOT THE SAME USER}}}}}}');
      throw new ForbiddenException();
    }
    console.log('{{{{{{SAME USER}}}}}}');

    return true;
  }
}
