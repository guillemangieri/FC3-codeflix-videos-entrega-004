import { SearchInput } from '../../../../shared/application/search-input';
import {
  PaginationOutput,
  PaginationOutputMapper,
} from '../../../../shared/application/pagination-output';
import { IUseCase } from '../../../../shared/application/use-case.interface';
import {
  IVideoRepository,
  VideoSearchParams,
} from '../../../domain/video.repository';
import { VideoOutput } from '../common/video-output';
import { GetVideoUseCase } from '../get-video/get-video.use-case';

export type ListVideosInput = SearchInput<{
  title?: string;
  categories_id?: string[];
  genres_id?: string[];
  cast_members_id?: string[];
}>;

export type ListVideosOutput = PaginationOutput<VideoOutput>;

export class ListVideosUseCase implements IUseCase<
  ListVideosInput,
  ListVideosOutput
> {
  constructor(
    private videoRepo: IVideoRepository,
    private getVideoUseCase: GetVideoUseCase,
  ) {}

  async execute(input: ListVideosInput): Promise<ListVideosOutput> {
    const params = VideoSearchParams.create({
      ...input,
      filter: input.filter ?? undefined,
    });

    const result = await this.videoRepo.search(params);
    const items = await Promise.all(
      result.items.map((video) =>
        this.getVideoUseCase.execute({ id: video.video_id.id }),
      ),
    );

    return PaginationOutputMapper.toOutput(items, result);
  }
}
