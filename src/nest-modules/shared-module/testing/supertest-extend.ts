import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from 'supertest';

declare module 'supertest' {
  interface Test {
    authenticate(app: INestApplication, forceAdmin?: boolean): this;
  }
}

(Test.prototype as Test).authenticate = function <T extends Test>(
  this: T,
  app: INestApplication,
  forceAdmin = true,
) {
  const jwtService = app.get(JwtService);
  const token = jwtService.sign(
    forceAdmin
      ? {
          realm_access: {
            roles: ['admin-catalog'],
          },
        }
      : {},
  );
  this.set('Authorization', `Bearer ${token}`);
  return this;
};
