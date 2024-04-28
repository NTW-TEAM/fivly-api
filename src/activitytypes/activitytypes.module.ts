import { Module } from "@nestjs/common";
import { ActivityTypesController } from "./activitytypes.controller";
import { ActivityTypesService } from "./activitytypes.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ActivityType } from "./activitytype.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityType]),
  ],
  controllers: [ActivityTypesController],
  providers: [ActivityTypesService]
})
export class ActivityTypesModule {}
