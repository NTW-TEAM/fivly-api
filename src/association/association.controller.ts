import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CreateAssociationDto } from './create.association.dto';
import { AssociationService } from './association.service';
import { UpdateAssociationDto } from './update.association.dto';

@Controller('association')
export class AssociationController {
  constructor(private readonly associationService: AssociationService) {}

  @Get()
  get() {
    return this.associationService.get();
  }

  @Post()
  create(@Body() createAssociationDTO: CreateAssociationDto) {
    return this.associationService.create(createAssociationDTO);
  }

  @Put()
  update(@Body() updateAssociationDTO: UpdateAssociationDto) {
    return this.associationService.update(updateAssociationDTO);
  }
}
