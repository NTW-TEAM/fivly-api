import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from './donation.entity';
import Stripe from 'stripe';
import { AssociationService } from '../association/association.service';
import { User } from '../user/user.entity';

@Injectable()
export class DonationService {
  constructor(
    private readonly associationService: AssociationService,
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createDonationSession(amount: number, userId?: number) {
    let user: User | undefined;
    if (userId) {
      const tempUser = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!tempUser) {
        throw new NotFoundException('Invalid user ID');
      }
      user = tempUser;
    }
    console.log('getting stripe client');
    const stripe = await this.getStripeClient();
    console.log('getting association');
    const association = await this.associationService.get();
    console.log('creating stripe session');
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Donation à l'association ${association.name}`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${association.domainName}/success`,
      cancel_url: `${association.domainName}/cancel`,
      metadata: {
        userId: userId ? userId.toString() : null,
      },
      customer_email: user ? user.email : undefined,
    });

    console.log('Session : ', session);
    return session.url;
  }

  async getDonations(userId?: number) {
    if (userId) {
      return await this.donationRepository
        .createQueryBuilder('donation')
        .leftJoinAndSelect('donation.potentialUser', 'user')
        .where('user.id = :userId', { userId })
        .getMany();
    }
    return await this.donationRepository
      .createQueryBuilder('donation')
      .leftJoinAndSelect('donation.potentialUser', 'user')
      .getMany();
  }

  async handleWebhook(event: Stripe.Event) {
    const stripe = await this.getStripeClient();
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent as string,
      );
      const amount = paymentIntent.amount / 100; // amount in cents
      if (!session.metadata) {
        return;
      }
      const userId = session.metadata.userId
        ? parseInt(session.metadata.userId, 10)
        : null;

      const donation = new Donation();
      donation.amount = amount;
      donation.datetime = new Date();
      donation.potentialUser = userId ? ({ id: userId } as any) : null; // Reference user by ID if exists

      await this.donationRepository.save(donation);
    }
  }

  async getStripeClient() {
    const association = await this.associationService.get();
    return new Stripe(association.stripeKey, {
      apiVersion: '2024-06-20',
    });
  }
}
