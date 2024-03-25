import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/createuser.dto';
import { UserService } from './user.service';
import { ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  registerUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.registerUser(createUserDto);
  }
}
