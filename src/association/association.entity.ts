import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Association {
  @PrimaryColumn()
  name:string;
  @Column()
  domainName:string;
  @Column()
  stripeKey:string;
}