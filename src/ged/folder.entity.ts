import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { File } from './file.entity';
import { Permission } from './permission.entity';

@Entity()
export class Folder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  path: string;

  @OneToMany(() => Folder, (folder) => folder.parentFolder)
  childrenFolders: Folder[];

  @ManyToOne(() => Folder, (folder) => folder.childrenFolders, {
    onDelete: 'CASCADE',
  })
  parentFolder: Folder;

  @OneToMany(() => File, (file) => file.folder)
  files: File[];

  @OneToMany(() => Permission, (permission) => permission.folder)
  permissions: Permission[];
}
