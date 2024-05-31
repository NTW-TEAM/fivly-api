import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assembly } from './assembly.entity';
import { User } from '../user/user.entity';
import { AssemblyService } from './assembly.service';
import { AssemblyController } from './assembly.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Assembly, User])],
  providers: [AssemblyService],
  controllers: [AssemblyController],
})
export class AssemblyModule {}
