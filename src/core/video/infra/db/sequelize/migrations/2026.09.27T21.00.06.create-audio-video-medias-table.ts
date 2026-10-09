import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';
import { DataTypes, Sequelize } from 'sequelize';
import type { MigrationFn } from 'umzug';

// Snapshot of the current model. Keep historical migrations independent of model changes.
export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.createTable('audio_video_medias', {
    audio_video_media_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    raw_location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    encoded_location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(AudioVideoMediaStatus)),
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

  await sequelize.getQueryInterface().addConstraint('audio_video_medias', {
    fields: ['video_id'],
    type: 'foreign key',
    name: 'audio_video_medias_video_id',
    references: {
      table: 'videos',
      field: 'video_id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });

  // A previous migration or model synchronization may have created this index.
  /*
  const indexName = 'audio_video_medias_video_id_video_related_field';
  const indexes = (await queryInterface.showIndex(
    'audio_video_medias',
  )) as Array<{
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
      'audio_video_medias',
      ['video_id', 'video_related_field'],
      { name: indexName, unique: true },
    );
  }
  */
};

export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .removeConstraint('audio_video_medias', 'audio_video_medias_video_id');
  await sequelize.getQueryInterface().dropTable('audio_video_medias');
};
