import { DataTypes, Sequelize } from 'sequelize';
import type { MigrationFn } from 'umzug';

// Snapshot of the current model. Keep historical migrations independent of model changes.
export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.createTable('genre_video', {
    video_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: { model: 'videos', key: 'video_id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    genre_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: { model: 'genres', key: 'genre_id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  });
  await sequelize.getQueryInterface().addConstraint('genre_video', {
    fields: ['video_id'],
    type: 'foreign key',
    name: 'genre_video_video_id',
    references: {
      table: 'videos',
      field: 'video_id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });
  await sequelize.getQueryInterface().addConstraint('genre_video', {
    fields: ['genre_id'],
    type: 'foreign key',
    name: 'genre_video_genre_id',
    references: {
      table: 'genres',
      field: 'genre_id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });
};

export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .removeConstraint('genre_video', 'genre_video_video_id');
  await sequelize
    .getQueryInterface()
    .removeConstraint('genre_video', 'genre_video_genre_id');
  await sequelize.getQueryInterface().dropTable('genre_video');
};
