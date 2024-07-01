import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../roles/role.entity';
import { User } from '../user/user.entity';
import { Folder } from './folder.entity';
import { File } from './file.entity';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  access: Access;

  @ManyToOne(() => User, (user) => user.filePermissions)
  user: User;

  @ManyToOne(() => Role, (role) => role.filePermissions)
  role: Role;

  @ManyToOne(() => Folder, (folder) => folder.permissions)
  folder: Folder;

  @ManyToOne(() => File, (file) => file.permissions)
  file: File;
}

export enum Access {
  INHERIT = -1,
  NONE = 0,
  READ = 1,
  READ_WRITE = 2,
  MANAGE = 3,
}
