import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Give } from './give.entity';
import { User } from '../user/user.entity';
import { Crowdfunding } from './crowdfunding.entity';
import Stripe from 'stripe';
import { AssociationService } from '../association/association.service';
import { CreateCrowdfundingDto } from './creare.crowdfunding.dto';

@Injectable()
export class GiveService {
  constructor(
    private readonly associationService: AssociationService,
    @InjectRepository(Give)
    private giveRepository: Repository<Give>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Crowdfunding)
    private crowdfundingRepository: Repository<Crowdfunding>,
  ) {}

  async createGiveSession(
    userId: number,
    crowdfundingId: number,
    amount: number,
  ) {
    const stripe = await this.getStripeClient();
    const association = await this.associationService.get();
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const crowdfunding = await this.crowdfundingRepository.findOne({
      where: { id: crowdfundingId },
    });

    if (!user || !crowdfunding) {
      throw new NotFoundException('Invalid user or crowdfunding ID');
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Donation pour ${crowdfunding.title}`,
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
        userId: userId.toString(),
        crowdfundingId: crowdfundingId.toString(),
      },
      customer_email: user ? user.email : undefined,
    });
    console.log('Session : ', session);

    return session.url;
  }

  async handleWebhook(event: Stripe.Event) {
    console.log('HANDLE WEBHOOK ON GIVE CROWDFUNDING');
    const stripe = await this.getStripeClient();
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent as string,
      );
      console.log('Payment intent in webhook : ', paymentIntent);
      console.log('PaymentIntent amount : ', paymentIntent.amount);
      const amount: number = paymentIntent.amount / 100; // amount in cents
      console.log('const amount (paymentIntent.amount / 100): ', amount);
      if (!session.metadata) {
        console.log('No metadata in session');
        return;
      }
      console.log('Session metadata', session.metadata);
      const userId = parseInt(session.metadata.userId, 10);
      const crowdfundingId = parseInt(session.metadata.crowdfundingId, 10);

      const user = await this.userRepository.findOne({ where: { id: userId } });
      const crowdfunding = await this.crowdfundingRepository.findOne({
        where: { id: crowdfundingId },
      });

      if (user && crowdfunding) {
        const give = new Give();
        give.amount = amount;
        give.datetime = new Date();
        give.user = user;
        give.crowdfunding = crowdfunding;

        console.log('Give : ', give);

        await this.giveRepository.save(give);

        // Update the actual amount in the crowdfunding project
        console.log(
          'crowdfunding.actualAmount before : ',
          crowdfunding.actualAmount,
        );
        crowdfunding.actualAmount = Number(crowdfunding.actualAmount);
        crowdfunding.actualAmount += amount;
        console.log(
          'crowdfunding.actualAmount after : ',
          crowdfunding.actualAmount,
        );
        await this.crowdfundingRepository.save(crowdfunding);
      }
    }
  }

  async getStripeClient() {
    const association = await this.associationService.get();
    return new Stripe(association.stripeKey, {
      apiVersion: '2024-04-10',
    });
  }

  async createCrowdfunding(createCrowdfundingDto: CreateCrowdfundingDto) {
    const crowdfunding = new Crowdfunding();
    crowdfunding.title = createCrowdfundingDto.title;
    crowdfunding.description = createCrowdfundingDto.description;
    crowdfunding.goalAmount = createCrowdfundingDto.goalAmount;
    crowdfunding.actualAmount = 0;
    crowdfunding.beginDatetime = createCrowdfundingDto.beginDatetime;
    crowdfunding.endDatetime = createCrowdfundingDto.endDatetime;
    const user = await this.userRepository.findOne({
      where: { id: createCrowdfundingDto.creator },
    });
    if (!user) {
      throw new NotFoundException('Invalid user ID');
    }
    crowdfunding.creator = user;
    crowdfunding.gives = [];

    return await this.crowdfundingRepository.save(crowdfunding);
  }

  async getCrowdfundings(onlyActive?: boolean): Promise<Crowdfunding[]> {
    const queryBuilder = this.crowdfundingRepository
      .createQueryBuilder('crowdfunding')
      .leftJoinAndSelect('crowdfunding.creator', 'creator')
      .leftJoinAndSelect('crowdfunding.gives', 'gives');

    if (onlyActive !== undefined) {
      const now = new Date();
      if (onlyActive === true) {
        console.log('onlyActive is true');
        queryBuilder.where('crowdfunding.endDatetime > :now', { now });
      } else if (onlyActive === false) {
        console.log('onlyActive is false');
        queryBuilder.where('crowdfunding.endDatetime < :now', { now });
      }
    } else {
      console.log('onlyActive is undefined');
    }

    return await queryBuilder.getMany();
  }

  async endCrowdfunding(id: number) {
    // set endDatetime to now
    const crowdfunding = await this.crowdfundingRepository.findOne({
      where: { id },
    });
    if (!crowdfunding) {
      throw new NotFoundException('Invalid crowdfunding ID');
    }
    crowdfunding.endDatetime = new Date();
    return await this.crowdfundingRepository.save(crowdfunding);
  }

  async getGives(userId: number, crowdfundingId: number | undefined) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Invalid user ID');
    }
    let queryBuilder = this.giveRepository
      .createQueryBuilder('give')
      .leftJoinAndSelect('give.user', 'user')
      .leftJoinAndSelect('give.crowdfunding', 'crowdfunding')
      .where('user.id = :userId', { userId });

    if (crowdfundingId) {
      const crowdfunding = await this.crowdfundingRepository.findOne({
        where: { id: crowdfundingId },
      });
      if (!crowdfunding) {
        throw new NotFoundException('Invalid crowdfunding ID');
      }
      queryBuilder = queryBuilder.andWhere(
        'crowdfunding.id = :crowdfundingId',
        { crowdfundingId },
      );
    }

    // remove user from the query
    if (crowdfundingId) {
      queryBuilder = queryBuilder.select([
        'give.id',
        'give.amount',
        'give.datetime',
      ]);
    } else {
      queryBuilder = queryBuilder.select([
        'give.id',
        'give.amount',
        'give.datetime',
        'crowdfunding',
      ]);
    }

    return await queryBuilder.getMany();
  }
}
