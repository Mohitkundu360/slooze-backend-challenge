import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { CountryGuard } from './country.guard';

@Module({
  providers: [AuthResolver, AuthService, PrismaService, JwtAuthGuard, RolesGuard, CountryGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard, CountryGuard],
})
export class AuthModule {}
