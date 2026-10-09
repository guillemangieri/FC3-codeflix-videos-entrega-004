import { DataTypes, Sequelize } from 'sequelize';
import type { MigrationFn } from 'umzug';

// Snapshot of the current model. Keep historical migrations independent of model changes.
export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.createTable('image_medias', {
    image_media_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    video_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'videos', key: 'video_id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    video_related_field: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  });
  await sequelize.getQueryInterface().addConstraint('image_medias', {
    fields: ['video_id'],
    type: 'foreign key',
    name: 'image_medias_video_id',
    references: {
      table: 'videos',
      field: 'video_id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });

  // A previous migration or model synchronization may have created this index.
  /*
  const indexName = 'image_medias_video_id_video_related_field';
  const indexes = (await queryInterface.showIndex('image_medias')) as Array<{
    name: string;
    unique: boolean;
    fields: Array<{ attribute: string; length?: number }>;
  }>;
  const existingIndex = indexes.find((index) => index.name === indexName);
  if (existingIndex) {
    const fields = existingIndex.fields.map((field) => field.attribute);
    if (
      !existingIndex.unique ||
      fields.join(',') !== 'video_id,video_related_field' ||
      existingIndex.fields.some((field) => field.length != null)
    ) {
      throw new Error(
        'Existing index ' + indexName + ' has an incompatible definition',
      );
    }
  } else {
    await queryInterface.addIndex(
      'image_medias',
      ['video_id', 'video_related_field'],
      { name: indexName, unique: true },
    );
  }
  */
};

export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .removeConstraint('image_medias', 'image_medias_video_id');
  await sequelize.getQueryInterface().dropTable('image_medias');
};
