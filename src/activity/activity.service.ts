import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Activity } from "./activity.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { SearchActivityDTO } from "./dto/searchactivity.dto";
import { CreateActivityDTO } from "./dto/createactivity.dto";
import { ActivityType } from "../activitytypes/activitytype.entity";
import { User } from "../user/user.entity";
import { UpdateActivityDTO } from "./dto/updateactivity.dto";

@Injectable()
export class ActivityService {

  constructor(
    @InjectRepository(ActivityType) private activityTypeRepository: Repository<ActivityType>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Activity) private activityRepository: Repository<Activity>) {
  }


  async getById(id: number): Promise<Activity|null> {
    return await this.activityRepository.findOne({
      where: { id: id },
      relations: ['participants']
    });
  }

  async update(id: number, updateActivityDTO: UpdateActivityDTO): Promise<void> {
    // if update dto is empty
    if (Object.keys(updateActivityDTO).length === 0) {
      throw new BadRequestException('No data provided');
    }

    const activity = await this.activityRepository.findOneBy({ id });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    const activityType = await this.activityTypeRepository.findOneBy({ name: updateActivityDTO.activityType });
    if (!activityType) {
      throw new BadRequestException('Activity type not found');
    }

    const owner = await this.userRepository.findOneBy({ id: updateActivityDTO.owner });
    if (!owner) {
      throw new BadRequestException('Owner not found');
    }

    await this.activityRepository.update(id, {
      ...updateActivityDTO,
      activityType,
      owner,
    });
  }

  async delete(id: number): Promise<void> {
    const activity = await this.activityRepository.findOneBy({ id });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    await this.activityRepository.remove(activity);
  }

  async search(searchActivityDto: SearchActivityDTO): Promise<Activity[]> {
    // all fields of searchActivityDto are optional
    // if no field is provided, return all activities
    if (Object.keys(searchActivityDto).length === 0) {
      return await this.activityRepository.find();
    }

    // check activityType and owner
    if (searchActivityDto.activityType) {
      const activityType = await this.activityTypeRepository.findOneBy({ name: searchActivityDto.activityType });
      if (!activityType) {
        throw new BadRequestException('Activity type not found');
      }
    }

    if (searchActivityDto.owner) {
      const owner = await this.userRepository.findOneBy({ id: searchActivityDto.owner });
      if (!owner) {
        throw new BadRequestException('Owner not found');
      }
    }

    // sum up all the fields of searchActivityDto
    // to create a WHERE clause in the query
    // keep in mind that participant is one in the array of participants in an activity
    // so we need to use the @> operator to search for an array containing the participant
    const where = Object.keys(searchActivityDto).map(key => {
      if (key === 'participant') {
        return `activity.${key} @> ARRAY[:${key}]`;
      }
      if (key === 'beginDateFrom') {
        return `activity.beginDateTime >= :${key}`;
      }
      if (key === 'beginDateTo') {
        return `activity.beginDateTime <= :${key}`;
      }
      if (key === 'endDateFrom') {
        return `activity.endDateTime >= :${key}`;
      }
      if (key === 'endDateTo') {
        return `activity.endDateTime <= :${key}`;
      }
      return `activity.${key} = :${key}`;
    }).join(' AND ');

    // create the query
    return await this.activityRepository.createQueryBuilder('activity')
      .where(where, searchActivityDto)
      .leftJoinAndSelect('activity.activityType', 'activityType')
      .leftJoin('activity.owner', 'owner')
      .addSelect(['owner.id', 'owner.firstName', 'owner.lastName', 'owner.email'])
      .leftJoinAndSelect('activity.participants', 'participants')
      .getMany();
  }


  async create(createActivityDTO: CreateActivityDTO) {
    const activityType = await this.activityTypeRepository.findOneBy({ name: createActivityDTO.activityType });

    if (!activityType) {
      throw new BadRequestException('Activity type not found');
    }

    const owner = await this.userRepository.findOneBy({ id: createActivityDTO.owner });

    if (!owner) {
      throw new BadRequestException('Owner not found');
    }

    let newActivity = {
      participants: [],
      ...createActivityDTO,
      activityType,
      owner,
    };
    const definedActivity = this.activityRepository.create(newActivity);
    await this.activityRepository.save(definedActivity);
  }


  async registerUserToActivity(activityId: number, userId: number) {
    const activity = await this.activityRepository.findOne({
      where:{id: activityId },
    relations: ['participants'] });

    if (!activity) {
      throw new BadRequestException('Activity not found');
    }
    console.log(activity.participants)

    // if user is already registered, throw an error
    if (activity.participants.some(p => p.id == userId)) {
      throw new ConflictException('User already registered');
    }

    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    activity.participants = [...activity.participants, user];
    await this.activityRepository.save(activity);
  }

  async unregisterUserFromActivity(activityId: number, userId: number) {
    const activity = await this.activityRepository.findOne({
      where:{id: activityId },
      relations: ['participants'] });

    if (!activity) {
      throw new BadRequestException('Activity not found');
    }

    // if user is not registered, throw an error
    if (!activity.participants.some(p => p.id == userId)) {
      throw new NotFoundException('User not registered');
    }

    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    activity.participants = activity.participants.filter(p => p.id !== user.id);
    await this.activityRepository.save(activity);
  }
}
