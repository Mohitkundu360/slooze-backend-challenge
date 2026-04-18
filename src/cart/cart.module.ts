import { Module } from '@nestjs/common';
import { CartResolver } from './cart.resolver';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [CartResolver, PrismaService],
})
export class CartModule {}
