import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import {
  ListCastMembersFilter,
  ListCastMembersInput,
} from '../../../core/cast-member/application/use-cases/list-cast-members/list-cast-members.input';
import { CastMemberTypes } from '../../../core/cast-member/domain/cast-member-type.vo';

class SearchCastMemberFilterDto extends ListCastMembersFilter {
  @Type(() => Number)
  @IsOptional()
  declare type?: CastMemberTypes | null;
}

export class SearchCastMemberDto extends ListCastMembersInput {
  @Type(() => SearchCastMemberFilterDto)
  declare filter?: SearchCastMemberFilterDto;
}
