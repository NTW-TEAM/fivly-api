import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createuser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async registerUser(createUserDto: CreateUserDto): Promise<void> {
    const newUser = this.userRepository.create(createUserDto);

    // Hachage du mot de passe
    const salt = await bcrypt.genSalt();
    newUser.password = await bcrypt.hash(newUser.password, salt);

    // Définition de la date et heure actuelles pour lastConnection
    newUser.lastConnection = new Date();

    // Sauvegarde de l'utilisateur sans attendre de valeur de retour
    await this.userRepository.save(newUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ email });
  }
}
