import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Get,
  Query,
  Patch,
  Param,
} from '@nestjs/common';
import { DonationService } from './donation.service';
import { GiveService } from './give.service';
import Stripe from 'stripe';
import { AssociationService } from '../association/association.service';
import { CreateCrowdfundingDto } from './creare.crowdfunding.dto';
import { Crowdfunding } from './crowdfunding.entity';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly associationService: AssociationService,
    private readonly donationService: DonationService,
    private readonly giveService: GiveService,
  ) {}

  @Post('crowdfunding')
  async createCrowdfunding(
    @Body() createCrowdfundingDto: CreateCrowdfundingDto,
  ) {
    return await this.giveService.createCrowdfunding(createCrowdfundingDto);
  }

  @Get('crowdfunding')
  async getCrowdfundings(
    @Query() query: { onlyActive?: string },
  ): Promise<Crowdfunding[]> {
    const onlyActive = this.convertToBoolean(query.onlyActive);
    return await this.giveService.getCrowdfundings(onlyActive);
  }

  @Patch('crowdfunding/:id')
  async endCrowdfunding(@Param('id') id: number) {
    return await this.giveService.endCrowdfunding(id);
  }

  private convertToBoolean(value?: string): boolean | undefined {
    if (value === undefined) {
      return undefined;
    }
    return value.toLowerCase() === 'true';
  }

  @Get('donations')
  async getDonations(@Query() query: { user?: number }) {
    return await this.donationService.getDonations(query.user);
  }

  @Get('gives/:userId')
  async getGives(
    @Param('userId') userId: number,
    @Query() query: { crowdfunding?: number },
  ) {
    return await this.giveService.getGives(userId, query.crowdfunding);
  }

  @Post('create-donation-session')
  async createDonationSession(
    @Body() createDonationDto: { amount: number; userId?: number },
  ) {
    const sessionUrl = await this.donationService.createDonationSession(
      createDonationDto.amount,
      createDonationDto.userId,
    );
    return { sessionUrl };
  }

  @Post('create-give-session')
  async createGiveSession(
    @Body()
    createGiveDto: {
      userId: number;
      crowdfundingId: number;
      amount: number;
    },
  ) {
    const sessionUrl = await this.giveService.createGiveSession(
      createGiveDto.userId,
      createGiveDto.crowdfundingId,
      createGiveDto.amount,
    );
    return { sessionUrl };
  }

  @Post('webhook')
  async handleWebhook(@Req() req: any, @Res() res: any) {
    console.log('Webhook received');
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;

    const stripe = await this.getStripeClient();
    const webhookKey = await this.associationService
      .get()
      .then((association) => association.stripeWebhookSecret);
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookKey);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('Webhook event received : ', event.type);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Session received handle webhook : ', session);

      if (!session.metadata) {
        return res.status(400).send(`Webhook Error: No metadata provided`);
      }
      if (session.metadata.crowdfundingId) {
        await this.giveService.handleWebhook(event);
      } else {
        await this.donationService.handleWebhook(event);
      }
    }

    res.json({ received: true });
  }

  async getStripeClient() {
    const association = await this.associationService.get();
    return new Stripe(association.stripeKey, {
      apiVersion: '2024-04-10',
    });
  }
}
