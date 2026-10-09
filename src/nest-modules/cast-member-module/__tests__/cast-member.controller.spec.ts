import { CastMembersController } from '../cast-member.controller';

describe('CastMembersController', () => {
  let controller: CastMembersController;

  beforeEach(() => {
    controller = new CastMembersController();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
