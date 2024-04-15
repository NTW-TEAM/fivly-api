import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "./role.entity";
import { In, Repository } from "typeorm";
import { CreateRoleDto } from "./dto/createrole.dto";
import { Scope } from "../scope/scope.entity";
import { NotFoundError } from "rxjs";

@Injectable()
export class RolesService {
  constructor(@InjectRepository(Role) private roleRepository: Repository<Role>,
              @InjectRepository(Scope) private scopeRepository: Repository<Scope>) {}

  async getAllRoles(): Promise<Role[]> {
    return await this.roleRepository.find();
  }

  async findByName(name: string): Promise<Role | null> {
    return await this.roleRepository.findOneBy({ name: name});
  }

  async createRole(createRoleDto: CreateRoleDto) {
    // do the same than before but we need to add scopes after creating the role
    // createRoleDto without scopes (createRoleDto as name, description, and scopes)
    const roleCreate = { name: createRoleDto.name, description: createRoleDto.description };
    const newRole = this.roleRepository.create(roleCreate);
    console.log(newRole);

    // Récupération des entités Scope correspondantes
    if (createRoleDto.scopes && createRoleDto.scopes.length > 0) {
      newRole.scopes = await this.scopeRepository.find({
        where: {
          name: In(createRoleDto.scopes)
        }
      });
    }

    await this.roleRepository.save(newRole);
  }

  async getRoleWithScopes(name: string) {
    return await this.roleRepository.createQueryBuilder('role')
      .leftJoinAndSelect('role.scopes', 'scope')
      .where('role.name = :name', { name })
      .getOne();
  }

  async deleteRole(name: string): Promise<void> {
    // check if role exists before deleting, if doesn't exist throw an error
    const role = await this.findByName(name);
    if (!role) {
      throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
    }
    await this.roleRepository.delete({ name: name });
  }
}
