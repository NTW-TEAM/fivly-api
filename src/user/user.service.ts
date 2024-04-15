import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateUserDto } from './dto/createuser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from "../roles/role.entity";
import { RolesService } from "../roles/roles.service";
import { UpdateUserRequest } from "./dto/updateuserrequest.dto";

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

  async getAllUsers(): Promise<User[]> {
    // returns user without password and with roles and scopes
    return await this.userRepository.createQueryBuilder('user')
      .select(['user.id', 'user.firstName','user.lastName', 'user.email', 'user.phoneNumber', 'user.numberAndStreet', 'user.postalCode', 'user.city', 'user.country', 'user.lastConnection'])
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.scopes', 'scope')
      .getMany();
  }

  async hasScope(id: number, scope: string): Promise<boolean>
  {
    const user = await this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.scopes', 'scope')
      .where('user.id = :id', { id })
      .getOne();

    if(!user) {
      return false;
    }

    return user.scopes.some(s => s.name === scope);
  }

  async updateUser(userId: number, userUpdateRequest: UpdateUserRequest): Promise<User> {
    // Récupère l'utilisateur à mettre à jour
    let user = await this.getUser(userId);

    if(!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Met à jour les propriétés de l'utilisateur
    if (userUpdateRequest.firstName) {
      user.firstName = userUpdateRequest.firstName;
    }
    if (userUpdateRequest.lastName) {
      user.lastName = userUpdateRequest.lastName;
    }
    if (userUpdateRequest.email) {
      user.email = userUpdateRequest.email;
    }
    if (userUpdateRequest.password) {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(userUpdateRequest.password, salt);
    }
    if (userUpdateRequest.phoneNumber) {
      user.phoneNumber = userUpdateRequest.phoneNumber;
    }
    if (userUpdateRequest.numberAndStreet) {
      user.numberAndStreet = userUpdateRequest.numberAndStreet;
    }
    if (userUpdateRequest.postalCode) {
      user.postalCode = userUpdateRequest.postalCode;
    }
    if (userUpdateRequest.city) {
      user.city = userUpdateRequest.city;
    }
    if (userUpdateRequest.country) {
      user.country = userUpdateRequest.country;
    }

    // Sauvegarde les modifications
    return await this.userRepository.save(user);
  }

  async getUser(userId: number): Promise<User | null> {
    return await this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.scopes', 'scope')
      .where('user.id = :id', { id: userId})
      .getOne();
  }
}
