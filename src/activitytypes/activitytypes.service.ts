import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../user/user.entity";
import { Repository } from "typeorm";
import { ActivityType } from "./activitytype.entity";

@Injectable()
export class ActivityTypesService {

  constructor(
    @InjectRepository(ActivityType) private activityTypeRepository: Repository<ActivityType>) {
  }

  async getAll(): Promise<ActivityType[]> {
    return await this.activityTypeRepository.find();
  }

  async create(name: string): Promise<void> {
    // si le type d'activité existe déjà, on ne le crée pas
    const existingActivityType = await this.activityTypeRepository
      .createQueryBuilder('activityType')
      .where('activityType.name = :name', { name })
      .getOne();
    if (existingActivityType) {
      throw new HttpException('Activity type already exists', 409);
    }

    const newActivityType = this.activityTypeRepository.create({ name });
    await this.activityTypeRepository.save(newActivityType);
  }

  async delete(name: string): Promise<void> {
    const activityType = await this.activityTypeRepository
      .createQueryBuilder('activityType')
      .where('activityType.name = :name', { name })
      .getOne();
    if (!activityType) {
      throw new HttpException('Activity type not found', 404);
    }
    await this.activityTypeRepository.remove(activityType);
  }
}
