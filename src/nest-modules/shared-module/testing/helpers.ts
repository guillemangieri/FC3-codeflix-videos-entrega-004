import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { applyGlobalConfig } from '../../global-config';
import { getConnectionToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';

import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import {
  GenreModel,
  GenreCategoryModel,
} from '@core/genre/infra/db/sequelize/genre-model';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-members-sequelize';
import {
  VideoModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoCastMemberModel,
} from '../../../core/video/infra/db/sequelize/video.model';
import { ImageMediaModel } from '../../../core/video/infra/db/sequelize/image-media.model';
import { AudioVideoMediaModel } from '../../../core/video/infra/db/sequelize/audio-video-media.model';
import { AuthGuard } from '../../auth-module/auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export function startApp() {
  let _app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Isolate destructive table resets from the database configured in .env.e2e.
      .overrideProvider(getConnectionToken())
      .useFactory({
        factory: () =>
          new Sequelize({
            dialect: 'sqlite',
            storage: ':memory:',
            logging: false,
            models: [
              CategoryModel,
              GenreModel,
              GenreCategoryModel,
              CastMemberModel,
              VideoModel,
              VideoCategoryModel,
              VideoGenreModel,
              VideoCastMemberModel,
              ImageMediaModel,
              AudioVideoMediaModel,
            ],
          }),
      })
      .overrideProvider('UnitOfWork')
      .useFactory({
        factory: (sequelize: Sequelize) => {
          return new UnitOfWorkSequelize(sequelize);
        },
        inject: [getConnectionToken()],
      })
      /*
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: () => true,
      })
      */
      .overrideGuard(AuthGuard)
      .useFactory({
        inject: [JwtService],
        factory: (jwtService: JwtService) => {
          const realGuard = new AuthGuard(jwtService);

          return {
            canActivate(context: ExecutionContext) {
              if (context.getType() !== 'http') {
                return true;
              }

              const request = context.switchToHttp().getRequest();

              if (request.headers.authorization !== undefined) {
                return realGuard.canActivate(context);
              }

              return true;
            },
          };
        },
      })
      .compile();
    const sequelize = moduleFixture.get<Sequelize>(getConnectionToken());

    await sequelize.sync({ force: true });

    _app = moduleFixture.createNestApplication();
    applyGlobalConfig(_app);
    await _app.init();
  });

  afterEach(async () => {
    await _app?.close();
  });

  return {
    get app() {
      return _app;
    },
  };
}
