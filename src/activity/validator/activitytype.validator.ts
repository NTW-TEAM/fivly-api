import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ActivityType } from '../../activitytypes/activitytype.entity';

@ValidatorConstraint({ name: 'DoesActivityTypeExist', async: true })
@Injectable()
export class DoesActivityTypeExist implements ValidatorConstraintInterface {
  constructor(private entityManager: EntityManager) {}

  async validate(value: string) {
    const exist = await this.entityManager
      .getRepository(ActivityType)
      .findOneBy({ name: value });
    return exist !== null;
  }

  defaultMessage(args: ValidationArguments) {
    return `Activity type does not exists`;
  }
}
