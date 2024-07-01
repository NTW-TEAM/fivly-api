import { Module } from '@nestjs/common';
import { LocalsController } from './locals.controller';
import { LocalsService } from './locals.service';
import { Local } from './local.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Local])],
  controllers: [LocalsController],
  providers: [LocalsService],
})
export class LocalsModule {}
