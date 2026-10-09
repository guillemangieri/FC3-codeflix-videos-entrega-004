import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';
import { CastMemberTypes } from '../../../domain/cast-member-type.vo';

export type UpdateCastMemberInputConstructorProps = {
  id: string;
  name?: string;
  type?: CastMemberTypes;
};

export class UpdateCastMemberInput {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsInt()
  @IsOptional()
  type: CastMemberTypes;

  constructor(props?: UpdateCastMemberInputConstructorProps) {
    if (!props) return;
    this.id = props.id;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    props.name && (this.name = props.name);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    props.type && (this.type = props.type);
  }
}

export class ValidateUpdateCastMemberInput {
  static validate(input: UpdateCastMemberInput) {
    return validateSync(input);
  }
}
