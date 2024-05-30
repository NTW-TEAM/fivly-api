import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new HttpException('Invalid credentials.', 404);
    }
    // compare password with bcrypt
    const isPasswordMatching = await bcrypt.compare(password, user.password);

    if (!isPasswordMatching) {
      throw new HttpException('Invalid credentials.', 404);
    }

    const newLastConnection: Date = new Date();
    await this.userService.registerConnection(user.id, newLastConnection);
    user.lastConnection = newLastConnection;

    const { password: _, ...result } = user;

    return {
      access_token: await this.jwtService.signAsync(result),
    };
  }
}
