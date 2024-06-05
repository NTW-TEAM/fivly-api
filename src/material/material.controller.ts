import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/creatematerial.dto';
import { UpdateMaterialDto } from './dto/updatematerial.dto';
import { CreateMaterialModelDto } from './dto/creatematerialmodel.dto';
import { UpdateMaterialModelDto } from './dto/updatematerialmodel.dto';
import { AssignMaterialDto } from './dto/assignmaterial.dto';

@Controller('materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Get()
  findAll() {
    return this.materialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialService.findOne(id);
  }

  @Post()
  create(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialService.create(createMaterialDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateMaterialDto: UpdateMaterialDto) {
    return this.materialService.update(id, updateMaterialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materialService.remove(id);
  }

  @Get('model')
  findAllModels() {
    return this.materialService.findAllModels();
  }

  @Get('model/:name')
  findOneModel(@Param('name') name: string) {
    return this.materialService.findOneModel(name);
  }

  @Post('model')
  createMaterialModel(@Body() createMaterialModelDto: CreateMaterialModelDto) {
    return this.materialService.createMaterialModel(createMaterialModelDto);
  }

  @Put('model/:name')
  updateMaterialModel(@Param('name') name: string, @Body() updateMaterialModelDto: UpdateMaterialModelDto) {
    return this.materialService.updateMaterialModel(name, updateMaterialModelDto);
  }

  @Delete('model/:name')
  removeMaterialModel(@Param('name') name: string) {
    return this.materialService.removeMaterialModel(name);
  }

  @Post(':id/assign/:activityId')
  assignMaterialToActivity(@Param('id') id: string, @Param('activityId') activityId: number) {
    return this.materialService.assignMaterialToActivity(id, activityId);
  }

  @Delete(':id/unassign/:activityId')
  unassignMaterialFromActivity(@Param('id') id: string, @Param('activityId') activityId: number) {
    return this.materialService.unassignMaterialFromActivity(id, activityId);
  }

  @Post(':id/local/:localId')
  assignMaterialToLocal(@Param('id') id: string, @Param('localId') localId: number) {
    return this.materialService.assignMaterialToLocal(id, localId);
  }
}
