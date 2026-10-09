import { DataTypes, Sequelize } from 'sequelize';
import { migrator } from '../migrator';

describe('migrator Unit Tests', () => {
  let sequelize: Sequelize;

  beforeEach(() => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it('should run migrations with sequelize instance as context and register them in SequelizeMeta', async () => {
    const umzug = migrator(sequelize, {
      logger: undefined,
      migrations: [
        {
          name: 'test-create-categories-table',
          up: async ({ context }) => {
            await context.getQueryInterface().createTable('categories', {
              category_id: {
                type: DataTypes.UUID,
                allowNull: false,
                primaryKey: true,
              },
              name: {
                type: DataTypes.STRING,
                allowNull: false,
              },
            });
          },
          down: async ({ context }) => {
            await context.getQueryInterface().dropTable('categories');
          },
        },
      ],
    });

    await umzug.up();

    await expect(
      sequelize.getQueryInterface().describeTable('categories'),
    ).resolves.toMatchObject({
      category_id: expect.objectContaining({
        allowNull: false,
        primaryKey: true,
      }),
      name: expect.objectContaining({
        allowNull: false,
      }),
    });

    await expect(
      sequelize.getQueryInterface().describeTable('SequelizeMeta'),
    ).resolves.toBeDefined();

    await expect(umzug.executed()).resolves.toEqual([
      { name: 'test-create-categories-table', path: undefined },
    ]);
  });
});
