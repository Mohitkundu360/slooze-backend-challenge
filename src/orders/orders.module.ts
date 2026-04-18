import { Module } from '@nestjs/common';
import { OrdersResolver } from './orders.resolver';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [OrdersResolver, PrismaService],
})
export class OrdersModule {}
