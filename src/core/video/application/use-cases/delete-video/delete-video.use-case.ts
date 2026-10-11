import { IUseCase } from '../../../../shared/application/use-case.interface';
import { IUnitOfWork } from '../../../../shared/domain/repository/unit-of-work.interface';
import { VideoId } from '../../../domain/video.aggregate';
import { IVideoRepository } from '../../../domain/video.repository';

export type DeleteVideoInput = {
  id: string;
};

export class DeleteVideoUseCase implements IUseCase<DeleteVideoInput, void> {
  constructor(
    private uow: IUnitOfWork,
    private videoRepo: IVideoRepository,
  ) {}

  async execute(input: DeleteVideoInput): Promise<void> {
    const videoId = new VideoId(input.id);

    await this.uow.do(async () => {
      await this.videoRepo.delete(videoId);
    });
  }
}
