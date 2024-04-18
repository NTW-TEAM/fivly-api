import { Injectable } from '@nestjs/common';
import { Membership } from "./membership.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MembershipDto } from "./membership.dto";

@Injectable()
export class MembershipService {

  constructor(@InjectRepository(Membership) private membershipRepository: Repository<Membership>) {}

  async getAllMemberships(): Promise<MembershipDto[]> {
    const memberships: Membership[] = await this.membershipRepository.createQueryBuilder('membership')
      .leftJoinAndSelect('membership.user', 'user')
      .getMany();

    // map memberships to return MembershipDto with method new MembershipDto().fromMembership(membership)
    return memberships.map(membership => new MembershipDto().fromMembership(membership));
  }
}
