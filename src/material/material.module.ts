import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './material.entity';
import { MaterialModel } from './materialmodel.entity';
import { Activity } from '../activity/activity.entity';
import { Local } from '../locals/local.entity';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Material, MaterialModel, Activity, Local])],
  providers: [MaterialService],
  controllers: [MaterialController],
})
export class MaterialModule {}
