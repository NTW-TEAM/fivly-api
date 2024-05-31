import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assembly } from './assembly.entity';
import { User } from '../user/user.entity';
import { CreateAssemblyDto } from "./dto/create.assembly.dto";
import { UpdateAssemblyDto } from "./dto/update.assembly.dto";

@Injectable()
export class AssemblyService {
  constructor(
    @InjectRepository(Assembly)
    private readonly assemblyRepository: Repository<Assembly>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createAssembly(createAssemblyDto: CreateAssemblyDto): Promise<Assembly> {
    const assembly = this.assemblyRepository.create(createAssemblyDto);
    return await this.assemblyRepository.save(assembly);
  }

  async updateAssembly(id: number, updateAssemblyDto: UpdateAssemblyDto): Promise<Assembly> {
    const assembly = await this.assemblyRepository.findOne({ where: { id },
      relations: ['participants'] });
    if (!assembly) {
      throw new NotFoundException(`Assembly with ID ${id} not found`);
    }
    Object.assign(assembly, updateAssemblyDto);
    return await this.assemblyRepository.save(assembly);
  }

  async deleteAssembly(id: number): Promise<void> {
    const result = await this.assemblyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Assembly with ID ${id} not found`);
    }
  }

  async getAssembly(id: number): Promise<Assembly> {
    const assembly = await this.assemblyRepository.findOne({
      where: { id },
      relations: ['participants']
    });
    if (!assembly) {
      throw new NotFoundException(`Assembly with ID ${id} not found`);
    }

    await this.assemblyRepository.createQueryBuilder('assembly')
      .leftJoinAndSelect('assembly.participants', 'participants')
      .where('assembly.id = :id', { id })
      .getOne();

    return assembly;
  }



  async getAllAssemblies(): Promise<Assembly[]> {
    return await this.assemblyRepository.find(
      { relations: ['participants'] }
    );
  }

  async participateInAssembly(assemblyId: number, userId: number): Promise<void> {
    const assembly = await this.assemblyRepository.findOne({
      where: { id: assemblyId },
      relations: ['participants']
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!assembly || !user) {
      throw new NotFoundException('Assembly or User not found');
    }

    if(assembly.participants.some(participant => participant.id === userId)){
      throw new ConflictException('User is already participating in assembly');
    }

    assembly.participants.push(user);
    await this.assemblyRepository.save(assembly);
  }


  async removeParticipationInAssembly(assemblyId: number, userId: number): Promise<void> {
    const assembly = await this.assemblyRepository.findOne({
      where: { id: assemblyId },
      relations: ['participants']
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!assembly || !user || !assembly.participants.some(participant => participant.id === userId)){
      throw new NotFoundException('Assembly or User not found, or user is not participating in assembly');
    }

    assembly.participants = assembly.participants.filter(participant => participant.id !== userId);
    await this.assemblyRepository.save(assembly);
  }

}
