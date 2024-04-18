import { Membership } from "./membership.entity";

export class MembershipDto {
  id: number;
  membershipDate: Date;
  user: {
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    numberAndStreet: string,
    postalCode: string,
    city: string,
    country: string,
    lastConnection: Date
  };

  // find a way to create MembershipDto from Membership
  fromMembership(membership: Membership): MembershipDto {
    this.id = membership.id;
    this.membershipDate = membership.membershipDate;
    this.user = {
      id: membership.user.id,
      firstName: membership.user.firstName,
      lastName: membership.user.lastName,
      email: membership.user.email,
      phoneNumber: membership.user.phoneNumber,
      numberAndStreet: membership.user.numberAndStreet,
      postalCode: membership.user.postalCode,
      city: membership.user.city,
      country: membership.user.country,
      lastConnection: membership.user.lastConnection
    };

    return this;
  }
}