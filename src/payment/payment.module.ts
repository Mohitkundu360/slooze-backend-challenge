import { Module } from '@nestjs/common';
import { PaymentResolver } from './payment.resolver';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [PaymentResolver, PrismaService],
})
export class PaymentModule {}
