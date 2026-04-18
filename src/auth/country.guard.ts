import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';

export const COUNTRY_KEY = 'country';
export const CountryRestricted = () => (target: any, key: string, descriptor: PropertyDescriptor) => {
  Reflect.defineMetadata(COUNTRY_KEY, true, descriptor.value);
  return descriptor;
};

@Injectable()
export class CountryGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;
    const args = ctx.getArgs();

    if (!user) return true;

    // If a countryFilter is provided in args, verify user belongs to that country
    if (args.countryFilter && user.role !== 'ADMIN') {
      if (args.countryFilter !== user.country) {
        throw new ForbiddenException(
          `Access denied. You can only access resources from your country: ${user.country}`
        );
      }
    }

    return true;
  }
}
