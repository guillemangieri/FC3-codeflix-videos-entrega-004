import { Transform } from 'class-transformer';
import { VideoOutput } from '../../core/video/application/use-cases/common/video-output';

export class VideoPresenter implements VideoOutput {
  id: string;
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: VideoOutput['rating'];
  is_opened: boolean;
  is_published: boolean;

  categories_id: string[];
  categories: VideoOutput['categories'];

  genres_id: string[];
  genres: VideoOutput['genres'];

  cast_members_id: string[];
  cast_members: VideoOutput['cast_members'];

  @Transform(({ value }: { value: Date }) => value.toISOString(), {
    toPlainOnly: true,
  })
  created_at: Date;

  constructor(output: VideoOutput) {
    this.id = output.id;
    this.title = output.title;
    this.description = output.description;
    this.year_launched = output.year_launched;
    this.duration = output.duration;
    this.rating = output.rating;
    this.is_opened = output.is_opened;
    this.is_published = output.is_published;
    this.categories_id = output.categories_id;
    this.categories = output.categories;
    this.genres_id = output.genres_id;
    this.genres = output.genres;
    this.cast_members_id = output.cast_members_id;
    this.cast_members = output.cast_members;
    this.created_at = output.created_at;
  }
}
