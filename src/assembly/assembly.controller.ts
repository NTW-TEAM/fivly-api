import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AssemblyService } from './assembly.service';
import { CreateAssemblyDto } from './dto/create.assembly.dto';
import { UpdateAssemblyDto } from './dto/update.assembly.dto';
import { Scope, Scopes } from '../authorization/scope.decorator';
import { CreateVoteSessionDto } from './dto/create.votesession.dto';
import { VoteDto } from './dto/vote.dto';
import { UserIsSameUserHasVoterGuard } from './vote.assembly.checker.guard';

@Controller('assemblies')
export class AssemblyController {
  constructor(private readonly assemblyService: AssemblyService) {}

  @Post()
  @Scopes(Scope.ASSEMBLIES_MANAGE)
  async createAssembly(@Body() createAssemblyDto: CreateAssemblyDto) {
    return this.assemblyService.createAssembly(createAssemblyDto);
  }

  @Patch(':id')
  @Scopes(Scope.ASSEMBLIES_MANAGE)
  async updateAssembly(
    @Param('id') id: number,
    @Body() updateAssemblyDto: UpdateAssemblyDto,
  ) {
    return this.assemblyService.updateAssembly(id, updateAssemblyDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Scopes(Scope.ASSEMBLIES_MANAGE)
  async deleteAssembly(@Param('id') id: number) {
    return this.assemblyService.deleteAssembly(id);
  }

  @Get(':id')
  async getAssembly(@Param('id') id: number) {
    return this.assemblyService.getAssembly(id);
  }

  @Get()
  async getAllAssemblies() {
    return this.assemblyService.getAllAssemblies();
  }

  @Post(':id/participate/:userId')
  async participateInAssembly(
    @Param('id') assemblyId: number,
    @Param('userId') userId: number,
  ) {
    return this.assemblyService.participateInAssembly(assemblyId, userId);
  }

  @Delete(':id/participate/:userId')
  @HttpCode(204)
  async removeParticipationInAssembly(
    @Param('id') assemblyId: number,
    @Param('userId') userId: number,
  ) {
    return this.assemblyService.removeParticipationInAssembly(
      assemblyId,
      userId,
    );
  }

  // handle vote_session
  @Post(':id/vote-session')
  @Scopes(Scope.ASSEMBLIES_MANAGE)
  async createVoteSession(
    @Param('id') assemblyId: number,
    @Body() createVoteSessionDto: CreateVoteSessionDto,
  ) {
    return this.assemblyService.createVoteSession(
      assemblyId,
      createVoteSessionDto,
    );
  }

  @Patch(':id/vote-session/:voteSessionId')
  @Scopes(Scope.ASSEMBLIES_MANAGE)
  @HttpCode(204)
  async cancelVoteSession(
    @Param('id') assemblyId: number,
    @Param('voteSessionId') voteSessionId: number,
  ) {
    return this.assemblyService.cancelVoteSession(assemblyId, voteSessionId);
  }

  @Delete(':id/vote-session/:voteSessionId')
  @HttpCode(204)
  @Scopes(Scope.ASSEMBLIES_MANAGE)
  async deleteVoteSession(
    @Param('id') assemblyId: number,
    @Param('voteSessionId') voteSessionId: number,
  ) {
    return this.assemblyService.deleteVoteSession(assemblyId, voteSessionId);
  }

  @Get(':id/vote-session/:voteSessionId')
  async getVoteSession(
    @Param('id') assemblyId: number,
    @Param('voteSessionId') voteSessionId: number,
  ) {
    return this.assemblyService.getVoteSession(assemblyId, voteSessionId);
  }

  @Get(':id/vote-session')
  async getAllVoteSessions(@Param('id') assemblyId: number) {
    return this.assemblyService.getAllVoteSessions(assemblyId);
  }

  @UseGuards(UserIsSameUserHasVoterGuard)
  @Post(':id/vote-session/:voteSessionId/votes')
  async vote(
    @Param('id') assemblyId: number,
    @Param('voteSessionId') voteSessionId: number,
    @Body() voteDto: VoteDto,
  ) {
    return this.assemblyService.vote(assemblyId, voteSessionId, voteDto);
  }

  @Get(':id/vote-session/:voteSessionId/votes')
  async getVotes(
    @Param('id') assemblyId: number,
    @Param('voteSessionId') voteSessionId: number,
  ) {
    return this.assemblyService.getVotes(voteSessionId);
  }
}
