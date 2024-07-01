import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { LocalsService } from './locals.service';
import { Local } from './local.entity';
import { ApiResponse } from '@nestjs/swagger';
import { Scope, Scopes } from '../authorization/scope.decorator';
import { CreateLocalDTO } from './dto/createlocal.dto';
import { UpdateLocalDTO } from './dto/updatelocal.dto';

@Controller('locals')
export class LocalsController {
  constructor(private LocalsService: LocalsService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Get all locals',
  })
  @HttpCode(200)
  async getLocals(): Promise<Local[]> {
    return await this.LocalsService.getLocals();
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: 'The local has been successfully created.',
  })
  @HttpCode(201)
  @Scopes(Scope.LOCALS_MANAGE)
  async create(@Body() createLocalDTO: CreateLocalDTO): Promise<void> {
    return await this.LocalsService.create(createLocalDTO);
  }

  @Delete(':localId')
  @ApiResponse({
    status: 204,
    description: 'The local has been successfully deleted.',
  })
  @Scopes(Scope.LOCALS_MANAGE)
  @HttpCode(204)
  async delete(@Param('localId') localId: number): Promise<void> {
    return await this.LocalsService.delete(localId);
  }

  @Patch(':localId')
  @ApiResponse({
    status: 204,
    description: 'The local has been successfully updated.',
  })
  @Scopes(Scope.LOCALS_MANAGE)
  @HttpCode(204)
  async update(
    @Param('localId') localId: number,
    @Body() updateLocalDTO: UpdateLocalDTO,
  ): Promise<void> {
    return await this.LocalsService.update(localId, updateLocalDTO);
  }

  @Get(':localId')
  @ApiResponse({
    status: 200,
    description: 'Get local by id',
  })
  async getById(@Param('localId') localId: number): Promise<Local | null> {
    return await this.LocalsService.getById(localId);
  }
}
