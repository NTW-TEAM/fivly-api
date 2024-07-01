import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssociationDto } from './create.association.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Association } from './association.entity';
import { Repository } from 'typeorm';
import { UpdateAssociationDto } from './update.association.dto';

@Injectable()
export class AssociationService {
  constructor(
    @InjectRepository(Association)
    private associationRepository: Repository<Association>,
  ) {}

  async create(createAssociationDTO: CreateAssociationDto) {
    await this.associationRepository.save(createAssociationDTO);
  }

  async update(updateAssociationDTO: UpdateAssociationDto) {
    await this.associationRepository.delete({});
    const association = new Association();
    updateAssociationDTO.name
      ? (association.name = updateAssociationDTO.name)
      : association.name;
    updateAssociationDTO.domainName
      ? (association.domainName = updateAssociationDTO.domainName)
      : association.domainName;
    updateAssociationDTO.stripeKey
      ? (association.stripeKey = updateAssociationDTO.stripeKey)
      : association.stripeKey;
    updateAssociationDTO.stripeWebhookSecret
      ? (association.stripeWebhookSecret =
          updateAssociationDTO.stripeWebhookSecret)
      : association.stripeWebhookSecret;
    return await this.associationRepository.save(association);
  }

  async get() {
    const associations = await this.associationRepository.find();
    return associations[0];
  }
}
