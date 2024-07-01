import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Local } from './local.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLocalDTO } from './dto/createlocal.dto';
import { UpdateLocalDTO } from './dto/updatelocal.dto';

@Injectable()
export class LocalsService {
  constructor(
    @InjectRepository(Local) private localRepository: Repository<Local>,
  ) {}
  async getLocals(): Promise<Local[]> {
    return await this.localRepository.find();
  }

  async create(createLocalDTO: CreateLocalDTO): Promise<void> {
    await this.localRepository.save(createLocalDTO);
  }

  async delete(localId: number): Promise<void> {
    const local = await this.localRepository.findOneBy({ id: localId });
    if (!local) {
      throw new NotFoundException('Local not found');
    }
    await this.localRepository.delete(localId);
  }

  async update(localId: number, updateLocalDTO: UpdateLocalDTO): Promise<void> {
    // if update dto is empty
    if (Object.keys(updateLocalDTO).length === 0) {
      throw new BadRequestException('No data provided');
    }

    const local = await this.localRepository.findOneBy({ id: localId });
    if (!local) {
      throw new NotFoundException('Local not found');
    }
    await this.localRepository.update(localId, updateLocalDTO);
  }

  async getById(localId: number): Promise<Local | null> {
    const local = await this.localRepository.findOneBy({ id: localId });
    if (!local) {
      throw new NotFoundException('Local not found');
    }
    return local;
  }
}
