import { DataTypes, Sequelize } from 'sequelize';
import type { MigrationFn } from 'umzug';

// Snapshot of the current model. Keep historical migrations independent of model changes.
export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.createTable('category_genre', {
    genre_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: { model: 'genres', key: 'genre_id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: { model: 'categories', key: 'category_id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  });

  await sequelize.getQueryInterface().addConstraint('category_genre', {
    fields: ['genre_id'],
    type: 'foreign key',
    name: 'category_genre_genre_id',
    references: {
      table: 'genres',
      field: 'genre_id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });

  await sequelize.getQueryInterface().addConstraint('category_genre', {
    fields: ['category_id'],
    type: 'foreign key',
    name: 'category_genre_category_id',
    references: {
      table: 'categories',
      field: 'category_id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });
};

export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .removeConstraint('category_genre', 'category_genre_genre_id');
  await sequelize
    .getQueryInterface()
    .removeConstraint('category_genre', 'category_genre_category_id');
  await sequelize.getQueryInterface().dropTable('category_genre');
};
