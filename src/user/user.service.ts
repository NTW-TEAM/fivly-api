import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createuser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from "../roles/role.entity";
import { RolesService } from "../roles/roles.service";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private roleService: RolesService,
  ) {}

  async registerUser(createUserDto: CreateUserDto): Promise<void> {
    const newUser = this.userRepository.create(createUserDto);

    // Hachage du mot de passe
    const salt = await bcrypt.genSalt();
    newUser.password = await bcrypt.hash(newUser.password, salt);

    // Définition de la date et heure actuelles pour lastConnection
    newUser.lastConnection = new Date();

    // Trouve le rôle "member" et l'attribue au nouvel utilisateur
    const memberRole = await this.roleService.findByName('member');
    if (!memberRole) {
      // Optionnel : créer le rôle "member" s'il n'existe pas ou lancer une exception
      throw new Error('Role "member" not found');
    } else {
      newUser.roles = [memberRole];
    }

    // Sauvegarde de l'utilisateur sans attendre de valeur de retour
    await this.userRepository.save(newUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.scopes', 'scope')
      .where('user.email = :email', { email })
      .getOne();
  }

  async registerConnection(userId: number, date: Date): Promise<void> {
    await this.userRepository.update(userId, { lastConnection: date });
  }
}
