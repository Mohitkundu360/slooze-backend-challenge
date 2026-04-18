import { Resolver, Query, Mutation, Args, ObjectType, Field, ID, Float, Int, Context } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MenuItemType, RestaurantType } from '../restaurants/restaurants.resolver';
import { UserType } from '../auth/auth.resolver';

@ObjectType()
export class OrderItemType {
  @Field(() => ID) id: number;
  @Field(() => Int) quantity: number;
  @Field(() => Float) price: number;
  @Field(() => MenuItemType) menuItem: MenuItemType;
}

@ObjectType()
export class OrderType {
  @Field(() => ID) id: number;
  @Field(() => Float) totalAmount: number;
  @Field() status: string;
  @Field() country: string;
  @Field() createdAt: Date;
  @Field(() => UserType) user: UserType;
  @Field(() => RestaurantType) restaurant: RestaurantType;
  @Field(() => [OrderItemType]) items: OrderItemType[];
}

@Resolver()
export class OrdersResolver {
  constructor(private prisma: PrismaService) {}

  // ALL roles can view their own orders
  @Query(() => [OrderType])
  @UseGuards(JwtAuthGuard)
  async myOrders(@Context() ctx: any) {
    const user = ctx.req.user;
    return this.prisma.order.findMany({
      where: { userId: user.id },
      include: {
        user: true,
        restaurant: true,
        items: { include: { menuItem: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ADMIN can view all orders
  @Query(() => [OrderType])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async allOrders(@Args('country', { nullable: true }) country?: string) {
    return this.prisma.order.findMany({
      where: country ? { country: country as any } : {},
      include: {
        user: true,
        restaurant: true,
        items: { include: { menuItem: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ALL roles can create orders
  @Mutation(() => OrderType)
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Args('restaurantId') restaurantId: number,
    @Context() ctx: any,
  ) {
    const user = ctx.req.user;

    // Get user's cart
    const cart = await this.prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { menuItem: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty. Add items before placing an order.');
    }

    // Verify restaurant exists and is in user's country (Re-BAC)
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) throw new Error('Restaurant not found');

    if (user.role !== 'ADMIN' && restaurant.country !== user.country) {
      throw new ForbiddenException(
        `You can only order from restaurants in your country: ${user.country}`
      );
    }

    // Calculate total
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity, 0
    );

    // Create order
    const order = await this.prisma.order.create({
      data: {
        userId: user.id,
        restaurantId,
        totalAmount,
        country: user.country,
        status: 'PENDING',
        items: {
          create: cart.items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.menuItem.price,
          })),
        },
      },
      include: {
        user: true,
        restaurant: true,
        items: { include: { menuItem: true } },
      },
    });

    // Clear cart after order
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return order;
  }

  // ADMIN and MANAGER can checkout/pay — MEMBER cannot
  @Mutation(() => OrderType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async checkoutOrder(
    @Args('orderId') orderId: number,
    @Context() ctx: any,
  ) {
    const user = ctx.req.user;
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    if (!order) throw new Error('Order not found');
    if (order.status !== 'PENDING') throw new Error('Order is not in PENDING state');

    // Re-BAC: Manager can only checkout orders in their country
    if (user.role === 'MANAGER' && order.country !== user.country) {
      throw new ForbiddenException('You can only checkout orders in your country');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
      include: {
        user: true,
        restaurant: true,
        items: { include: { menuItem: true } },
      },
    });
  }

  // ADMIN and MANAGER can cancel — MEMBER cannot
  @Mutation(() => OrderType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async cancelOrder(
    @Args('orderId') orderId: number,
    @Context() ctx: any,
  ) {
    const user = ctx.req.user;
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    if (!order) throw new Error('Order not found');
    if (order.status === 'CANCELLED') throw new Error('Order already cancelled');
    if (order.status === 'PAID') throw new Error('Cannot cancel a paid order');

    // Re-BAC: Manager can only cancel orders in their country
    if (user.role === 'MANAGER' && order.country !== user.country) {
      throw new ForbiddenException('You can only cancel orders in your country');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      include: {
        user: true,
        restaurant: true,
        items: { include: { menuItem: true } },
      },
    });
  }
}
