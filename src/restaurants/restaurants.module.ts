import { Module } from '@nestjs/common';
import { RestaurantsResolver } from './restaurants.resolver';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [RestaurantsResolver, PrismaService],
})
export class RestaurantsModule {}
