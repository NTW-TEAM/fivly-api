import { Column, Entity, PrimaryColumn } from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';

@Entity()
export class Association {
  @PrimaryColumn()
  name: string;
  @Column()
  domainName: string;
  @Column()
  stripeKey: string;
  @Column()
  stripeWebhookSecret: string;
}
