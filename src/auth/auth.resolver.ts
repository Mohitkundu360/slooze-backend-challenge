import { Resolver, Mutation, Args, ObjectType, Field, ID } from '@nestjs/graphql';
import { AuthService } from './auth.service';

@ObjectType()
export class UserType {
  @Field(() => ID) id: number;
  @Field() email: string;
  @Field() name: string;
  @Field() role: string;
  @Field() country: string;
  @Field() createdAt: Date;
}

@ObjectType()
export class AuthResponse {
  @Field() token: string;
  @Field(() => UserType) user: UserType;
}

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async register(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('name') name: string,
    @Args('role', { defaultValue: 'MEMBER' }) role: string,
    @Args('country', { defaultValue: 'INDIA' }) country: string,
  ) {
    return this.authService.register(email, password, name, role, country);
  }

  @Mutation(() => AuthResponse)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    return this.authService.login(email, password);
  }
}