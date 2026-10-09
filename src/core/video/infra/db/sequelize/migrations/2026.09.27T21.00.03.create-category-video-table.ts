import { DataTypes, Sequelize } from 'sequelize';
import type { MigrationFn } from 'umzug';

// Snapshot of the current model. Keep historical migrations independent of model changes.
export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.createTable('category_video', {
    video_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: { model: 'videos', key: 'video_id' },
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
  await sequelize.getQueryInterface().addConstraint('category_video', {
    fields: ['video_id'],
    type: 'foreign key',
    name: 'category_video_video_id',
    references: {
      table: 'videos',
      field: 'video_id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });
  await sequelize.getQueryInterface().addConstraint('category_video', {
    fields: ['category_id'],
    type: 'foreign key',
    name: 'category_video_category_id',
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
    .removeConstraint('category_video', 'category_video_video_id');
  await sequelize
    .getQueryInterface()
    .removeConstraint('category_video', 'category_video_category_id');
  await sequelize.getQueryInterface().dropTable('category_video');
};
