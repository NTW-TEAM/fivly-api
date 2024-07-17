import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assembly } from './assembly.entity';
import { User } from '../user/user.entity';
import { AssemblyService } from './assembly.service';
import { AssemblyController } from './assembly.controller';
import { VoteSession } from "./votesession.entity";
import { Vote } from "./vote.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Assembly, VoteSession, Vote, User])],
  providers: [AssemblyService],
  controllers: [AssemblyController],
})
export class AssemblyModule {}