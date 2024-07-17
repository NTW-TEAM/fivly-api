import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { CreateActivityDTO } from "./dto/createactivity.dto";
import { ActivityService } from "./activity.service";
import { Scope, Scopes } from "../authorization/scope.decorator";
import { SearchActivityDTO } from "./dto/searchactivity.dto";
import { Activity } from "./activity.entity";
import { ApiResponse } from "@nestjs/swagger";
import { UpdateActivityDTO } from "./dto/updateactivity.dto";

@Controller('activities')
export class ActivityController {

  constructor(private activityService: ActivityService) {
  }

  @Post("/search")
  @ApiResponse({
    status: 200,
    description: 'Search for activities',
  })
  @HttpCode(200)
  async search(@Body() searchActivityDTO: SearchActivityDTO): Promise<Activity[]> {
    return await this.activityService.search(searchActivityDTO);
  }

  @Patch(":activityId")
  @ApiResponse({
    status: 200,
    description: 'The activity has been successfully updated.',
  })
  @Scopes(Scope.ACTIVITIES_MANAGE)
  @HttpCode(204)
  async update(@Param("activityId") activityId: number, @Body() updateActivityDTO: UpdateActivityDTO): Promise<void> {
    return await this.activityService.update(activityId, updateActivityDTO);
  }

  @Get(":activityId")
@ApiResponse({
    status: 200,
    description: 'Get activity by id',
  })
  async getById(@Param("activityId") activityId: number): Promise<Activity | null> {
    return await this.activityService.getById(activityId);
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: 'The activity has been successfully created.',
  })
  @Scopes(Scope.ACTIVITIES_MANAGE)
  async create(@Body() createActivityDTO: CreateActivityDTO): Promise<void> {
    return await this.activityService.create(createActivityDTO);
  }

  @Delete(":activityId")
  @ApiResponse({
    status: 204,
    description: 'The activity has been successfully deleted.',
  })
  @Scopes(Scope.ACTIVITIES_MANAGE)
  @HttpCode(204)
  async delete(@Param("activityId") activityId: number): Promise<void> {
    return await this.activityService.delete(activityId);
  }

  @Post(":activityId/registry/:userId")
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully registered to the activity.',
  })
  async registerUserToActivity(@Param("activityId") activityId: number, @Param("userId") userId: number): Promise<void> {
    return await this.activityService.registerUserToActivity(activityId, userId);
  }

  @Delete(":activityId/registry/:userId")
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully unregistered from the activity.',
  })
  async unregisterUserFromActivity(@Param("activityId") activityId: number, @Param("userId") userId: number): Promise<void> {
    return await this.activityService.unregisterUserFromActivity(activityId, userId);
  }


}
