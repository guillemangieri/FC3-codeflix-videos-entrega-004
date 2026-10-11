import request from 'supertest';
import {
  Category,
  CategoryId,
} from '../../src/core/category/domain/category.aggregate';
import { Genre } from '../../src/core/genre/domain/genre.aggregate';
import { CastMember } from '../../src/core/cast-member/domain/cast-member.aggregate';
import { ICategoryRepository } from '../../src/core/category/domain/category.repository';
import { IGenreRepository } from '../../src/core/genre/domain/genre.repository';
import { ICastMemberRepository } from '../../src/core/cast-member/domain/cast-member.repository';
import { Video } from '../../src/core/video/domain/video.aggregate';
import { IVideoRepository } from '../../src/core/video/domain/video.repository';
import { startApp } from '../../src/nest-modules/shared-module/testing/helpers';

describe('GET /videos', () => {
  const nestApp = startApp();

  async function createRelations() {
    const categoryRepo =
      nestApp.app.get<ICategoryRepository>('CategoryRepository');
    const genreRepo = nestApp.app.get<IGenreRepository>('GenreRepository');
    const castMemberRepo = nestApp.app.get<ICastMemberRepository>(
      'CastMemberRepository',
    );
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);
    const castMember = CastMember.fake().anActor().build();
    await castMemberRepo.insert(castMember);
    return { category, genre, castMember };
  }

  async function insertVideo(
    relations: Awaited<ReturnType<typeof createRelations>>,
    createdAt: Date,
  ) {
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(relations.category.category_id)
      .addGenreId(relations.genre.genre_id)
      .addCastMemberId(relations.castMember.cast_member_id)
      .withCreatedAt(createdAt)
      .build();
    await nestApp.app.get<IVideoRepository>('VideoRepository').insert(video);
    return video;
  }

  function list(query = {}) {
    return request(nestApp.app.getHttpServer()).get('/videos').query(query);
  }

  it('lists videos and includes their persisted relations', async () => {
    const relations = await createRelations();
    const video = await insertVideo(
      relations,
      new Date('2026-01-01T00:00:00Z'),
    );
    const { body } = await list().expect(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]).toMatchObject({
      id: video.video_id.id,
      categories_id: [relations.category.category_id.id],
      genres_id: [relations.genre.genre_id.id],
      cast_members_id: [relations.castMember.cast_member_id.id],
      categories: [
        expect.objectContaining({ id: relations.category.category_id.id }),
      ],
      genres: [expect.objectContaining({ id: relations.genre.genre_id.id })],
      cast_members: [
        expect.objectContaining({ id: relations.castMember.cast_member_id.id }),
      ],
    });
    expect(body.meta).toMatchObject({ total: 1, current_page: 1 });
  });

  it('combines all three filters and excludes partial matches', async () => {
    const first = await createRelations();
    const second = await createRelations();
    const date = new Date('2026-01-01T00:00:00Z');
    const matching = await insertVideo(first, date);
    await insertVideo({ ...first, category: second.category }, date);
    await insertVideo({ ...first, genre: second.genre }, date);
    await insertVideo({ ...first, castMember: second.castMember }, date);
    const { body } = await list({
      categories_id: first.category.category_id.id,
      genres_id: first.genre.genre_id.id,
      cast_members_id: first.castMember.cast_member_id.id,
    }).expect(200);
    expect(body.data.map((video: { id: string }) => video.id)).toEqual([
      matching.video_id.id,
    ]);
    expect(body.meta.total).toBe(1);
  });

  it.each(['categories_id', 'genres_id', 'cast_members_id'])(
    'rejects an invalid UUID in %s',
    async (field) => {
      await list({ [field]: 'invalid-id' }).expect(422);
    },
  );

  it('returns an empty collection when no category matches', async () => {
    await insertVideo(
      await createRelations(),
      new Date('2026-01-01T00:00:00Z'),
    );
    const { body } = await list({ categories_id: new CategoryId().id }).expect(
      200,
    );
    expect(body.data).toEqual([]);
    expect(body.meta.total).toBe(0);
  });

  it('paginates without repeating videos and preserves the total', async () => {
    const relations = await createRelations();
    const older = await insertVideo(
      relations,
      new Date('2026-01-01T00:00:00Z'),
    );
    const newer = await insertVideo(
      relations,
      new Date('2026-01-02T00:00:00Z'),
    );
    const first = await list({ page: 1, per_page: 1 }).expect(200);
    const second = await list({ page: 2, per_page: 1 }).expect(200);
    expect(first.body.data.map((video: { id: string }) => video.id)).toEqual([
      newer.video_id.id,
    ]);
    expect(second.body.data.map((video: { id: string }) => video.id)).toEqual([
      older.video_id.id,
    ]);
    expect(first.body.meta).toMatchObject({
      total: 2,
      current_page: 1,
      per_page: 1,
      last_page: 2,
    });
    expect(second.body.meta).toMatchObject({
      total: 2,
      current_page: 2,
      per_page: 1,
      last_page: 2,
    });
  });
});
