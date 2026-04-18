import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  await app.listen(3000);
  console.log('\n🚀 Slooze Backend is running!');
  console.log('📊 GraphQL Playground: http://localhost:3000/graphql');
  console.log('\n🔑 Test Credentials:');
  console.log('Admin (India):   admin@slooze.com / admin123');
  console.log('Manager (India): manager@slooze.com / manager123');
  console.log('Member (India):  member@slooze.com / member123');
  console.log('Admin (US):      admin.us@slooze.com / admin123\n');
}
bootstrap();