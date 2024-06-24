import { Module } from '@nestjs/common';
import { AssociationController } from './association.controller';
import { AssociationService } from './association.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Association } from "./association.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Association])],
  controllers: [AssociationController],
  providers: [AssociationService]
})
export class AssociationModule {}
