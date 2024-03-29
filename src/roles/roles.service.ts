import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "./role.entity";
import { Repository } from "typeorm";
import { CreateRoleDto } from "./dto/createrole.dto";

@Injectable()
export class RolesService {
  constructor(@InjectRepository(Role) private roleRepository: Repository<Role>) {}

  async findByName(name: string): Promise<Role | null> {
    return await this.roleRepository.findOneBy({ name: name});
  }

  async createRole(createRoleDto: CreateRoleDto) {
    const newRole = this.roleRepository.create(createRoleDto);
    console.log(newRole);
    await this.roleRepository.save(newRole);
  }

  async getRoleWithScopes(id: number) {
    return await this.roleRepository.createQueryBuilder('role')
      .leftJoinAndSelect('role.scopes', 'scope')
      .where('role.id = :id', { id })
      .getOne();
  }
}
