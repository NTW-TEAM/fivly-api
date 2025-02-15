import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/createuser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { RolesService } from '../roles/roles.service';
import { UpdateUserRequest } from './dto/updateuserrequest.dto';
import { ScopeService } from '../scope/scope.service';
import { UpdateScopesDTO } from './dto/update.scopes.dto';
import { Membership } from '../membership/membership.entity';
import { CreateAdminDto } from './dto/createadmin.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Membership)
    private membershipRepository: Repository<Membership>,
    private roleService: RolesService,
    private scopeService: ScopeService,
  ) {}

  async registerUser(createUserDto: CreateUserDto): Promise<void> {
    if (createUserDto.firstName === 'admin') {
      throw new HttpException(
        'You can not create an user with admin as firstname',
        HttpStatus.BAD_REQUEST,
      );
    }
    const newUser = this.userRepository.create(createUserDto);

    // Hachage du mot de passe
    const salt = await bcrypt.genSalt();
    newUser.password = await bcrypt.hash(newUser.password, salt);

    // Définition de la date et heure actuelles pour lastConnection
    newUser.lastConnection = new Date();
    newUser.isActive = true;

    // Trouve le rôle "member" et l'attribue au nouvel utilisateur
    const memberRole = await this.roleService.findByName('member');
    if (!memberRole) {
      // Optionnel : créer le rôle "member" s'il n'existe pas ou lancer une exception
      throw new Error('Role "member" not found');
    } else {
      newUser.roles = [memberRole];
    }

    // Sauvegarde de l'utilisateur sans attendre de valeur de retour
    const user: User = await this.userRepository.save(newUser);

    // creation du membership du user
    const membership = new Membership();
    membership.user = user;
    membership.membershipDate = new Date();

    await this.membershipRepository.save(membership);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('user')
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
    return await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.phoneNumber',
        'user.numberAndStreet',
        'user.postalCode',
        'user.city',
        'user.country',
        'user.lastConnection',
      ])
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.scopes', 'scope')
      .getMany();
  }

  async hasScope(id: number, scope: string): Promise<boolean> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.scopes', 'scope')
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      return false;
    }

    return user.scopes.some((s) => s.name === scope);
  }

  async isFirstStart() {
    const user = await this.userRepository.find({
      where: { firstName: 'admin' },
    });
    if (user.length > 0) {
      throw new NotFoundException('An admin user already exists');
    }
  }

  async updateUser(
    userId: number,
    userUpdateRequest: UpdateUserRequest,
  ): Promise<User> {
    // Récupère l'utilisateur à mettre à jour
    const user = await this.getUser(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Met à jour les propriétés de l'utilisateur
    if (userUpdateRequest.firstName) {
      if (userUpdateRequest.firstName === 'admin') {
        throw new HttpException(
          'You can not update the firstname to admin',
          HttpStatus.BAD_REQUEST,
        );
      }
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
    if (userUpdateRequest.isActive !== undefined) {
      user.isActive = userUpdateRequest.isActive;
    }

    // Sauvegarde les modifications
    return await this.userRepository.save(user);
  }

  async getUser(userId: number): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.scopes', 'scope')
      .where('user.id = :id', { id: userId })
      .getOne();
  }

  async updateUserScopes(
    userId: number,
    updateScopesDTO: UpdateScopesDTO,
  ): Promise<User> {
    const scopes: string[] = updateScopesDTO.scopes;

    // Récupère l'utilisateur à mettre à jour
    const user = await this.getUser(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Remplace les scopes de l'utilisateur
    user.scopes = [];
    for (const scope of scopes) {
      // Récupération de l'entity scope
      const scopeEntity = await this.scopeService.findByName(scope);
      if (!scopeEntity) {
        throw new HttpException(
          `Scope ${scope} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      user.scopes.push(scopeEntity);
    }

    // Sauvegarde les modifications
    return await this.userRepository.save(user);
  }

  async addRoleToUser(userId: number, roleName: string) {
    // Récupère l'utilisateur à mettre à jour
    const user = await this.getUser(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Vérifie si l'utilisateur a déjà le rôle
    if (user.roles.some((r) => r.name === roleName)) {
      throw new HttpException(
        `User already has role ${roleName}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Récupère le rôle à ajouter
    const role = await this.roleService.findByName(roleName);
    if (!role) {
      throw new HttpException(
        `Role ${roleName} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Ajoute le rôle à l'utilisateur
    user.roles.push(role);

    // Sauvegarde les modifications
    return await this.userRepository.save(user);
  }

  async removeRoleFromUser(userId: number, roleName: string) {
    // Récupère l'utilisateur à mettre à jour
    const user = await this.getUser(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Vérifie si l'utilisateur a le rôle à retirer
    if (!user.roles.some((r) => r.name === roleName)) {
      throw new HttpException(
        `User does not have role ${roleName}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Récupère le rôle à retirer
    const role = await this.roleService.findByName(roleName);
    if (!role) {
      throw new HttpException(
        `Role ${roleName} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Retire le rôle de l'utilisateur
    user.roles = user.roles.filter((r) => r.name !== roleName);

    // Sauvegarde les modifications
    return await this.userRepository.save(user);
  }

  async registerAdmin(createAdminDto: CreateAdminDto) {
    // check if a user has admin as firstname
    const user = await this.userRepository.find({
      where: { firstName: 'admin' },
    });
    if (user.length > 0) {
      throw new HttpException(
        'An admin user already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const admin = new User();
    admin.firstName = 'admin';
    admin.lastName = 'admin';
    admin.email = createAdminDto.email;
    // Hachage du mot de passe
    const salt = await bcrypt.genSalt();
    admin.password = await bcrypt.hash(createAdminDto.password, salt);
    admin.phoneNumber = '1234567890';
    admin.numberAndStreet = '123 rue de la rue';
    admin.postalCode = '12345';
    admin.city = 'Paris';
    admin.country = 'France';
    admin.isActive = true;
    admin.lastConnection = new Date();

    const roleAdmin = await this.roleService.findByName('admin');
    if (!roleAdmin) {
      throw new NotFoundException('Role admin not found');
    }
    admin.roles = [roleAdmin];
    await this.userRepository.save(admin);
    return admin;
  }
}
