import { ISearchableRepository } from '../../shared/domain/repository/repository-interface';
import { SearchParams } from '../../shared/domain/repository/search-params';
import { SearchResult } from '../../shared/domain/repository/search-result';
import { Uuid } from '../../shared/domain/value-objects/uuid.vo';
import { Category } from './category.aggregate';

export type CategoryFilter = string;

export class CategorySearchParams extends SearchParams<CategoryFilter> {}

export class CategorySearchResult extends SearchResult<Category> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ICategoryRepository extends ISearchableRepository<
  Category,
  Uuid,
  CategoryFilter,
  CategorySearchParams,
  CategorySearchResult
> {}
