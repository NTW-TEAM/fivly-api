import { Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post } from "@nestjs/common";
import { ActivityTypesService } from "./activitytypes.service";
import { ActivityType } from "./activitytype.entity";
import { ApiResponse } from "@nestjs/swagger";

@Controller('activity-types')
export class ActivityTypesController {

  constructor(private activitytypesService: ActivityTypesService) {
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Get all activity types',
  })
  async get(): Promise<ActivityType[]> {
    const data = await this.activitytypesService.getAll();
    // if data is empty, return 204
    if (data.length === 0) {
      throw new HttpException('No activity types found', HttpStatus.NO_CONTENT);
    }
    return data;
  }

  @Post(':name')
  @HttpCode(201)
  async create(@Param('name') name: string ): Promise<void> {
    return this.activitytypesService.create(name);
  }

  @Delete(':name')
  @HttpCode(204)
  async delete(@Param('name') name: string ): Promise<void> {
    return this.activitytypesService.delete(name);
  }



}
