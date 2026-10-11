import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { UnitOfWorkFakeInMemory } from '../../../../../shared/infra/db/in-memory/fake-unit-of-work-in-memory';
import { Video, VideoId } from '../../../../domain/video.aggregate';
import { VideoInMemoryRepository } from '../../../../infra/db/in-memory/video-in-memory.repository';
import { DeleteVideoUseCase } from '../delete-video.use-case';

describe('DeleteVideoUseCase', () => {
  let repository: VideoInMemoryRepository;
  let uow: UnitOfWorkFakeInMemory;
  let useCase: DeleteVideoUseCase;
  beforeEach(() => {
    repository = new VideoInMemoryRepository();
    uow = new UnitOfWorkFakeInMemory();
    useCase = new DeleteVideoUseCase(uow, repository);
  });

  it('should delete an existing video inside a transaction', async () => {
    const video = Video.fake().aVideoWithoutMedias().build();
    await repository.insert(video);
    const transactionSpy = jest.spyOn(uow, 'do');
    await useCase.execute({ id: video.video_id.id });
    expect(transactionSpy).toHaveBeenCalledTimes(1);
    await expect(repository.findById(video.video_id)).resolves.toBeNull();
  });

  it('should reject an unknown video', async () => {
    const id = new VideoId();
    await expect(useCase.execute({ id: id.id })).rejects.toThrow(
      new NotFoundError(id.id, Video),
    );
  });
});
