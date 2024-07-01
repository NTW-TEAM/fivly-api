import { Module } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './activity.entity';
import { User } from '../user/user.entity';
import { ActivityType } from '../activitytypes/activitytype.entity';
import { DoesActivityTypeExist } from './validator/activitytype.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity]),
    TypeOrmModule.forFeature([ActivityType]),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [ActivityController],
  providers: [ActivityService, DoesActivityTypeExist],
})
export class ActivityModule {}
