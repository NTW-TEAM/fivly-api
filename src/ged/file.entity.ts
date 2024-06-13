import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Folder } from "./folder.entity";
import { Permission } from "./permission.entity";

@Entity()
export class File {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  path: string;

  @ManyToOne(() => Folder, folder => folder.files)
  folder: Folder;

  @OneToMany(() => Permission, permission => permission.file)
  permissions: Permission[];
}