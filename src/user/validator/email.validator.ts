import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { EntityManager } from 'typeorm';
import { User } from '../user.entity';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'DoesMailExist', async: true })
@Injectable()
export class DoesMailExist implements ValidatorConstraintInterface {
  constructor(private entityManager: EntityManager) {}

  async validate(value: string) {
    const exist = await this.entityManager
      .getRepository(User)
      .findOneBy({ email: value });
    return exist === null;
  }

  defaultMessage(args: ValidationArguments) {
    return `Email already exists`;
  }
}
