import { INestApplication } from '@nestjs/common';

declare module 'supertest' {
  interface Test {
    authenticate(app: INestApplication, forceAdmin?: boolean): this;
  }
}

export {};
