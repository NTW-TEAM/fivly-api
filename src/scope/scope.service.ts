import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Scope } from "./scope.entity";
import { Role } from "../roles/role.entity";

@Injectable()
export class ScopeService {
  constructor(
    @InjectRepository(Scope) private scopeRepository: Repository<Scope>,
  ) {}
  async getAllScopes() {
    return await this.scopeRepository.find();
  }

  async findByName(name: string) {
    return await this.scopeRepository.findOneBy({ name: name });
  }
}
