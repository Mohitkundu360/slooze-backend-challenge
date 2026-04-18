import { Resolver, Query, Mutation, Args, ObjectType, Field, ID, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MenuItemType } from '../restaurants/restaurants.resolver';

@ObjectType()
export class CartItemType {
  @Field(() => ID) id: number;
  @Field(() => Int) quantity: number;
  @Field(() => MenuItemType) menuItem: MenuItemType;
}

@ObjectType()
export class CartType {
  @Field(() => ID) id: number;
  @Field(() => [CartItemType]) items: CartItemType[];
}

@Resolver()
export class CartResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => CartType, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async myCart(@Context() ctx: any) {
    const user = ctx.req.user;
    return this.prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { menuItem: true } } },
    });
  }

  @Mutation(() => CartType)
  @UseGuards(JwtAuthGuard)
  async addToCart(
    @Args('menuItemId') menuItemId: number,
    @Args('quantity', { defaultValue: 1 }) quantity: number,
    @Context() ctx: any,
  ) {
    const user = ctx.req.user;

    // Get or create cart
    let cart = await this.prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId: user.id } });
    }

    // Check if item exists in cart already
    const existing = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, menuItemId },
    });

    if (existing) {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, menuItemId, quantity },
      });
    }

    return this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { menuItem: true } } },
    });
  }

  @Mutation(() => CartType)
  @UseGuards(JwtAuthGuard)
  async removeFromCart(
    @Args('cartItemId') cartItemId: number,
    @Context() ctx: any,
  ) {
    const user = ctx.req.user;
    const cart = await this.prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) throw new Error('Cart not found');

    await this.prisma.cartItem.deleteMany({
      where: { id: cartItemId, cartId: cart.id },
    });

    return this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { menuItem: true } } },
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async clearCart(@Context() ctx: any) {
    const user = ctx.req.user;
    const cart = await this.prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) return true;

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return true;
  }
}
