import { Resolver, Query, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserType } from '../auth/auth.resolver';

@Resolver()
export class UsersResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => UserType)
  @UseGuards(JwtAuthGuard)
  async me(@Context() ctx: any) {
    return ctx.req.user;
  }

  @Query(() => [UserType])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async users() {
    return this.prisma.user.findMany();
  }
}