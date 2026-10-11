import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { generateKeyPairSync } from 'crypto';
import request from 'supertest';
import { AuthModule } from '../../src/nest-modules/auth-module/auth.module';

describe('Autenticação HTTP — guard real', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      publicKeyEncoding: { type: 'spki', format: 'pem' },
    });

    const config = {
      JWT_PRIVATE_KEY: privateKey,
      JWT_PUBLIC_KEY: publicKey,
    };

    const module = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .useMocker((token) => {
        if (token === ConfigService) {
          return {
            get: (key: keyof typeof config) => config[key],
          };
        }
      })
      .compile();

    app = module.createNestApplication();
    await app.init();
    jwtService = app.get(JwtService);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('rejeita requisição sem token', async () => {
    await request(app.getHttpServer()).get('/auth').expect(401);
  });

  it('rejeita token inválido', async () => {
    await request(app.getHttpServer())
      .get('/auth')
      .set('Authorization', 'Bearer token-invalido')
      .expect(401);
  });

  it('rejeita token expirado', async () => {
    const token = jwtService.sign({ sub: 'usuario-teste' }, { expiresIn: -1 });

    await request(app.getHttpServer())
      .get('/auth')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });

  it('aceita token válido', async () => {
    const token = jwtService.sign(
      { sub: 'usuario-teste' },
      { expiresIn: '5m' },
    );

    await request(app.getHttpServer())
      .get('/auth')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect({ name: 'ok' });
  });

  it('não disponibiliza o login demonstrativo', async () => {
    await request(app.getHttpServer())
      .post('/auth')
      .send({ email: 'teste@example.com', password: 'qualquer' })
      .expect(404);
  });
});
