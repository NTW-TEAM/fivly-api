import { Body, Controller, Delete, Get, HttpCode, Param, Post } from "@nestjs/common";
import { CreateActivityDTO } from "./dto/createactivity.dto";
import { ActivityService } from "./activity.service";
import { Scope, Scopes } from "../authorization/scope.decorator";
import { SearchActivityDTO } from "./dto/searchactivity.dto";
import { Activity } from "./activity.entity";
import { ApiResponse } from "@nestjs/swagger";

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

  @Post()
  @ApiResponse({
    status: 201,
    description: 'The activity has been successfully created.',
  })
  @Scopes(Scope.ACTIVITIES_MANAGE)
  async create(@Body() createActivityDTO: CreateActivityDTO): Promise<void> {
    return await this.activityService.create(createActivityDTO);
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
