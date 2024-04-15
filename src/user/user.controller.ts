import { Body, Controller, Get, HttpCode, HttpException, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CreateUserDto } from './dto/createuser.dto';
import { UserService } from './user.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from "./user.entity";
import { AuthGuard } from "../auth/auth.guard";
import { SelfUserGuard } from "./self.user.guard";
import { UpdateUserRequest } from "./dto/updateuserrequest.dto";
import { JwtService } from "@nestjs/jwt";

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService,
              private jwtService: JwtService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Get all users',
  })
  async getAllUsers(): Promise<User[]> {
    return await this.userService.getAllUsers();
  }

  @Post('register')
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  async registerUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.registerUser(createUserDto);
  }

  @UseGuards(SelfUserGuard) // This guard will check if the user is the same as the one he wants to update, or if he has the scope to update another user
  @Patch(':userId')
  @ApiResponse({
    status: 200,
    description: 'The user has been updated.'
  })
  async updateUser(@Param("userId") userId: number, @Body() userUpdateRequest: UpdateUserRequest) {
    const userUpdated = await this.userService.updateUser(userId, userUpdateRequest);
    const { password: _, ...result } = userUpdated;

    return {
      access_token: await this.jwtService.signAsync(result),
    };
  }

  @Get(':userId')
  @ApiResponse({
    status: 200,
    description: 'The user.'
  })
  async getUser(@Param("userId") userId: number) {
    const user = await this.userService.getUser(userId);

    if(!user) {
      throw new HttpException('User not found', 404);
    }

    const { password: _, ...result } = user;

    return result;
  }
}
