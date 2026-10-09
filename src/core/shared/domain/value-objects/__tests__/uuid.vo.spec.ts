import { Uuid, InvalidUuidError } from '../uuid.vo';
import { validate as uuidValidate } from 'uuid';

describe('Uuid Unit Tests', () => {
  const validatespy = jest.spyOn(Uuid.prototype as any, 'validate');
  test('should throw error when uuid is invalid', () => {
    expect(() => {
      new Uuid('invalid-uuid');
    }).toThrow(InvalidUuidError);
    expect(validatespy).toHaveBeenCalledTimes(1);
  });
  test('should create a valid uuid', () => {
    const uuid = new Uuid();
    expect(uuid.id).toBeDefined();
    expect(uuidValidate(uuid.id)).toBe(true);
  });
  test('should accept a valid uuid', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    const uuid = new Uuid(validUuid);
    expect(uuid.id).toBe(validUuid);
  });
});
