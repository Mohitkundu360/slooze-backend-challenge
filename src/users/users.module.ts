import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [UsersResolver, PrismaService],
})
export class UsersModule {}
