import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class UserIsSameUserHasVoterGuard implements CanActivate {

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const jwtUserId = request["user"].id;

    // get userId of VoteDto
    const userId = request.body.userId;
    if(jwtUserId != userId) {
      throw new ForbiddenException();
    }

    return true;
  }

}