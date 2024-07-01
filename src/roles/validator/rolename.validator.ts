import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Role } from '../role.entity';

@ValidatorConstraint({ name: 'DoesRoleNameExist', async: true })
@Injectable()
export class DoesRoleNameExist implements ValidatorConstraintInterface {
  constructor(private entityManager: EntityManager) {}

  async validate(value: string) {
    console.log('CHECKUP IF ROLE EXISTS');
    const exist = await this.entityManager
      .getRepository(Role)
      .findOneBy({ name: value });
    return exist === null;
  }

  defaultMessage(args: ValidationArguments) {
    return `Role already exists`;
  }
}
