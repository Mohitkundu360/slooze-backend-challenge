import { Resolver, Query, Mutation, Args, ObjectType, Field, ID, Context } from '@nestjs/graphql';
import { UseGuards} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ObjectType()
export class PaymentMethodType {
  @Field(() => ID) id: number;
  @Field() type: string;
  @Field() details: string;
  @Field() isDefault: boolean;
  @Field() userId: number;
}

@Resolver()
export class PaymentResolver {
  constructor(private prisma: PrismaService) {}

  // ADMIN only — view all payment methods
  @Query(() => [PaymentMethodType])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async allPaymentMethods() {
    return this.prisma.paymentMethod.findMany();
  }

  // ADMIN only — view own payment methods
  @Query(() => [PaymentMethodType])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async myPaymentMethods(@Context() ctx: any) {
    return this.prisma.paymentMethod.findMany({
      where: { userId: ctx.req.user.id },
    });
  }

  // ADMIN only — add payment method
  @Mutation(() => PaymentMethodType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async addPaymentMethod(
    @Args('type') type: string,
    @Args('details') details: string,
    @Args('isDefault', { defaultValue: false }) isDefault: boolean,
    @Context() ctx: any,
  ) {
    const userId = ctx.req.user.id;

    if (isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.paymentMethod.create({
      data: { userId, type, details, isDefault },
    });
  }

  // ADMIN only — update payment method
  @Mutation(() => PaymentMethodType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updatePaymentMethod(
    @Args('id') id: number,
    @Args('type', { nullable: true }) type?: string,
    @Args('details', { nullable: true }) details?: string,
    @Args('isDefault', { nullable: true }) isDefault?: boolean,
    @Context() ctx?: any,
  ) {
    const userId = ctx.req.user.id;

    if (isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.paymentMethod.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(details && { details }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });
  }

  // ADMIN only — delete payment method
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deletePaymentMethod(@Args('id') id: number) {
    await this.prisma.paymentMethod.delete({ where: { id } });
    return true;
  }
}
