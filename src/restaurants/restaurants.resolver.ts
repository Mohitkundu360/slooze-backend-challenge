import { Resolver, Query, Args, ObjectType, Field, ID, Float, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ObjectType()
export class MenuItemType {
  @Field(() => ID) id: number;
  @Field() name: string;
  @Field(() => Float) price: number;
  @Field() description: string;
  @Field() restaurantId: number;
}

@ObjectType()
export class RestaurantType {
  @Field(() => ID) id: number;
  @Field() name: string;
  @Field() cuisine: string;
  @Field() country: string;
  @Field(() => [MenuItemType], { nullable: true }) menuItems?: MenuItemType[];
}

@Resolver()
export class RestaurantsResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [RestaurantType])
  @UseGuards(JwtAuthGuard)
  async restaurants(
    @Context() ctx: any,
    @Args('country', { nullable: true }) country?: string,
  ) {
    const user = ctx.req.user;
    // Re-BAC: non-admin users can only see restaurants in their country
    const countryFilter = country || user.country;
    
    return this.prisma.restaurant.findMany({
      where: user.role === 'ADMIN' && country 
        ? { country: country as any }
        : { country: countryFilter as any },
      include: { menuItems: true },
    });
  }

  @Query(() => RestaurantType, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async restaurant(
    @Args('id') id: number,
    @Context() ctx: any,
  ) {
    const user = ctx.req.user;
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: { menuItems: true },
    });

    if (!restaurant) return null;

    // Re-BAC: restrict access to own country only (except ADMIN)
    if (user.role !== 'ADMIN' && restaurant.country !== user.country) {
      throw new Error(`Access denied. You can only view restaurants in your country: ${user.country}`);
    }

    return restaurant;
  }
}
