import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { AssemblyService } from "./assembly.service";
import { CreateAssemblyDto } from "./dto/create.assembly.dto";
import { UpdateAssemblyDto } from "./dto/update.assembly.dto";
import { Scope, Scopes } from "../authorization/scope.decorator";

@Controller('assemblies')
export class AssemblyController {
  constructor(private readonly assemblyService: AssemblyService) {}

  @Post()
  @Scopes(Scope.ASSEMBLIES_MANAGE)
  async createAssembly(@Body() createAssemblyDto: CreateAssemblyDto) {
    return this.assemblyService.createAssembly(createAssemblyDto);
  }

  @Patch(':id')
  @Scopes(Scope.ASSEMBLIES_MANAGE)
  async updateAssembly(@Param('id') id: number, @Body() updateAssemblyDto: UpdateAssemblyDto) {
    return this.assemblyService.updateAssembly(id, updateAssemblyDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Scopes(Scope.ASSEMBLIES_MANAGE)
  async deleteAssembly(@Param('id') id: number) {
    return this.assemblyService.deleteAssembly(id);
  }

  @Get(':id')
  async getAssembly(@Param('id') id: number) {
    return this.assemblyService.getAssembly(id);
  }

  @Get()
  async getAllAssemblies() {
    return this.assemblyService.getAllAssemblies();
  }

  @Post(':id/participate/:userId')
  async participateInAssembly(@Param('id') assemblyId: number, @Param('userId') userId: number) {
    return this.assemblyService.participateInAssembly(assemblyId, userId);
  }

  @Delete(':id/participate/:userId')
  @HttpCode(204)
  async removeParticipationInAssembly(@Param('id') assemblyId: number, @Param('userId') userId: number) {
    return this.assemblyService.removeParticipationInAssembly(assemblyId, userId);
  }
}
