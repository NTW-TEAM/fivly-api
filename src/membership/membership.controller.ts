import { Controller, Get } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { Membership } from './membership.entity';
import { ApiResponse } from '@nestjs/swagger';
import { MembershipDto } from './membership.dto';

@Controller('memberships')
export class MembershipController {
  constructor(private membershipService: MembershipService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Return all memberships',
  })
  async getAllMemberships(): Promise<MembershipDto[]> {
    return await this.membershipService.getAllMemberships();
  }
}
