import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { GiveService } from './give.service';
import { DonationService } from "./donation.service";
import { AssociationService } from "../association/association.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Give } from "./give.entity";
import { Donation } from "./donation.entity";
import { User } from "../user/user.entity";
import { Crowdfunding } from "./crowdfunding.entity";
import { Association } from "../association/association.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Give,Crowdfunding,Donation,User,Association])],
  controllers: [StripeController],
  providers: [GiveService,DonationService, AssociationService]
})
export class StripeModule {}
