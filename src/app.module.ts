import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { JwtModule } from '@nestjs/jwt';
import { join } from 'path';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      context: ({ req }) => ({ req }),
    }),
    JwtModule.register({
      global: true,
      secret: 'slooze-secret-key-2024',
      signOptions: { expiresIn: '7d' },
    }),
    AuthModule,
    UsersModule,
    RestaurantsModule,
    OrdersModule,
    CartModule,
    PaymentModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
