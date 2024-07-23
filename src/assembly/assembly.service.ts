import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assembly } from './assembly.entity';
import { User } from '../user/user.entity';
import { CreateAssemblyDto } from './dto/create.assembly.dto';
import { UpdateAssemblyDto } from './dto/update.assembly.dto';
import { VoteSession } from './votesession.entity';
import { Vote } from './vote.entity';
import { CreateVoteSessionDto } from './dto/create.votesession.dto';
import { VoteDto } from './dto/vote.dto';

@Injectable()
export class AssemblyService {
  constructor(
    @InjectRepository(Assembly)
    private readonly assemblyRepository: Repository<Assembly>,
    @InjectRepository(VoteSession)
    private readonly voteSessionRepository: Repository<VoteSession>,
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createAssembly(
    createAssemblyDto: CreateAssemblyDto,
  ): Promise<Assembly> {
    const assembly = this.assemblyRepository.create(createAssemblyDto);
    return await this.assemblyRepository.save(assembly);
  }

  async updateAssembly(
    id: number,
    updateAssemblyDto: UpdateAssemblyDto,
  ): Promise<Assembly> {
    const assembly = await this.assemblyRepository.findOne({
      where: { id },
      relations: ['participants'],
    });
    if (!assembly) {
      throw new NotFoundException(`Assembly with ID ${id} not found`);
    }
    Object.assign(assembly, updateAssemblyDto);
    return await this.assemblyRepository.save(assembly);
  }

  async deleteAssembly(id: number): Promise<void> {
    // check and delete participants
    const assembly = await this.assemblyRepository.findOne({
      where: { id },
      relations: ['participants'],
    });
    if (!assembly) {
      throw new NotFoundException(`Assembly with ID ${id} not found`);
    }

    assembly.participants = [];
    await this.assemblyRepository.save(assembly);

    // check and delete voteSessions
    const voteSessions = await this.voteSessionRepository.find({
      where: { assembly: { id } },
    });
    if (voteSessions.length > 0) {
      await this.voteSessionRepository.remove(voteSessions);
    }

    const result = await this.assemblyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Assembly with ID ${id} not found`);
    }
  }

  async getAssembly(id: number): Promise<Assembly> {
    const assembly = await this.assemblyRepository.findOne({
      where: { id },
      relations: ['participants'],
    });
    if (!assembly) {
      throw new NotFoundException(`Assembly with ID ${id} not found`);
    }

    await this.assemblyRepository
      .createQueryBuilder('assembly')
      .leftJoinAndSelect('assembly.participants', 'participants')
      .where('assembly.id = :id', { id })
      .getOne();

    return assembly;
  }

  async getAllAssemblies(): Promise<Assembly[]> {
    return await this.assemblyRepository.find({ relations: ['participants'] });
  }

  async participateInAssembly(
    assemblyId: number,
    userId: number,
  ): Promise<void> {
    const assembly = await this.assemblyRepository.findOne({
      where: { id: assemblyId },
      relations: ['participants'],
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!assembly || !user) {
      throw new NotFoundException('Assembly or User not found');
    }

    if (
      assembly.participants.some((participant) => participant.id === userId)
    ) {
      throw new ConflictException('User is already participating in assembly');
    }

    assembly.participants.push(user);
    await this.assemblyRepository.save(assembly);
  }

  async removeParticipationInAssembly(
    assemblyId: number,
    userId: number,
  ): Promise<void> {
    const assembly = await this.assemblyRepository.findOne({
      where: { id: assemblyId },
      relations: ['participants'],
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });

    console.log(assembly);

    if (
      !assembly ||
      !user ||
      !assembly.participants.some((participant) => participant.id == userId)
    ) {
      throw new NotFoundException(
        'Assembly or User not found, or user is not participating in assembly',
      );
    }

    assembly.participants = assembly.participants.filter(
      (participant) => participant.id != userId,
    );
    await this.assemblyRepository.save(assembly);
  }

  async createVoteSession(
    assemblyId: number,
    createVoteSessionDto: CreateVoteSessionDto,
  ): Promise<VoteSession> {
    const assembly = await this.assemblyRepository.findOneBy({
      id: assemblyId,
    });
    if (!assembly) {
      throw new NotFoundException(`Assembly with ID ${assemblyId} not found`);
    }
    // add canceled to false + createVoteSessionDto
    const voteSession = this.voteSessionRepository.create({
      ...createVoteSessionDto,
      canceled: false,
    });
    voteSession.assembly = assembly;
    return await this.voteSessionRepository.save(voteSession);
  }

  async cancelVoteSession(
    assemblyId: number,
    voteSessionId: number,
  ): Promise<void> {
    const voteSession = await this.voteSessionRepository.findOne({
      where: { id: voteSessionId, assembly: { id: assemblyId } },
    });
    if (!voteSession) {
      throw new NotFoundException(
        `VoteSession with ID ${voteSessionId} not found`,
      );
    }
    voteSession.canceled = !voteSession.canceled;
    await this.voteSessionRepository.save(voteSession);
  }

  async deleteVoteSession(
    assemblyId: number,
    voteSessionId: number,
  ): Promise<void> {
    const result = await this.voteSessionRepository.delete({
      id: voteSessionId,
      assembly: { id: assemblyId },
    });
    if (result.affected === 0) {
      throw new NotFoundException(
        `VoteSession with ID ${voteSessionId} not found`,
      );
    }
  }

  async getVoteSession(
    assemblyId: number,
    voteSessionId: number,
  ): Promise<VoteSession> {
    const voteSession = await this.voteSessionRepository.findOne({
      where: { id: voteSessionId, assembly: { id: assemblyId } },
    });
    if (!voteSession) {
      throw new NotFoundException(
        `VoteSession with ID ${voteSessionId} not found`,
      );
    }
    return voteSession;
  }

  async getAllVoteSessions(assemblyId: number): Promise<VoteSession[]> {
    return await this.voteSessionRepository.find({
      where: { assembly: { id: assemblyId } },
    });
  }

  async vote(
    assemblyId: number,
    voteSessionId: number,
    voteDto: VoteDto,
  ): Promise<void> {
    const voteSession = await this.voteSessionRepository.findOne({
      where: { id: voteSessionId, assembly: { id: assemblyId } },
    });
    const user = await this.userRepository.findOne({
      where: { id: voteDto.userId },
    });
    if (!voteSession || !user) {
      throw new NotFoundException('VoteSession or User not found');
    }

    // add check if user already voted
    const existingVote = await this.voteRepository.findOne({
      where: { user, voteSession },
    });
    if (existingVote) {
      throw new ConflictException('User already voted');
    }

    const vote = this.voteRepository.create({
      for: voteDto.for,
      user,
      voteSession,
    });
    await this.voteRepository.save(vote);
  }

  async getVotes(voteSessionId: number): Promise<any> {
    const voteSession = await this.voteSessionRepository.findOne({
      where: { id: voteSessionId },
      relations: ['votes', 'votes.user'],
    });
    if (!voteSession) {
      throw new NotFoundException(
        `VoteSession with ID ${voteSessionId} not found`,
      );
    }

    if (voteSession.anonymous) {
      const forVotes = voteSession.votes.filter((vote) => vote.for).length;
      const againstVotes = voteSession.votes.filter((vote) => !vote.for).length;
      return { forVotes, againstVotes };
    } else {
      return voteSession.votes.map((vote) => ({
        user: {
          firstName: vote.user.firstName,
          lastName: vote.user.lastName,
        },
        for: vote.for,
      }));
    }
  }
}
