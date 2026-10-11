import request from 'supertest';
import { Video, VideoId } from '../../src/core/video/domain/video.aggregate';
import { IVideoRepository } from '../../src/core/video/domain/video.repository';
import { startApp } from '../../src/nest-modules/shared-module/testing/helpers';
import { VIDEOS_PROVIDERS } from '../../src/nest-modules/videos-module/videos.providers';
import { Category } from '../../src/core/category/domain/category.aggregate';
import { Genre } from '../../src/core/genre/domain/genre.aggregate';
import { CastMember } from '../../src/core/cast-member/domain/cast-member.aggregate';
import { ICategoryRepository } from '../../src/core/category/domain/category.repository';
import { IGenreRepository } from '../../src/core/genre/domain/genre.repository';
import { ICastMemberRepository } from '../../src/core/cast-member/domain/cast-member.repository';

describe('DELETE /videos/:id', () => {
  const nestApp = startApp();
  it('should delete a video and return an empty 204 response', async () => {
    const repository = nestApp.app.get<IVideoRepository>(
      VIDEOS_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide,
    );
    //const video = Video.fake().aVideoWithoutMedias().build();
    //await repository.insert(video);
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
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.category_id)
      .addGenreId(genre.genre_id)
      .addCastMemberId(castMember.cast_member_id)
      .build();
    await repository.insert(video);
    const response = await request(nestApp.app.getHttpServer())
      .delete(`/videos/${video.video_id.id}`)
      .expect(204);
    expect(response.text).toBe('');
    await expect(repository.findById(video.video_id)).resolves.toBeNull();
  });
  it('should return 404 for an unknown video', async () => {
    const id = new VideoId();
    await request(nestApp.app.getHttpServer())
      .delete(`/videos/${id.id}`)
      .expect(404);
  });
  it('should return 422 for an invalid UUID', async () => {
    await request(nestApp.app.getHttpServer())
      .delete('/videos/invalid-id')
      .expect(422);
  });
});
