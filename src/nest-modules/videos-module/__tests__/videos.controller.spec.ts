import { VideosController } from '../videos.controller';

describe('VideosController update', () => {
  const id = '8f4b7b9c-3f7a-4b6c-8b0c-1c9c5b8b9b6a';
  let controller: VideosController;
  let update: jest.Mock;
  let get: jest.Mock;
  let upload: jest.Mock;

  beforeEach(() => {
    controller = new VideosController();
    update = jest.fn().mockResolvedValue(undefined);
    get = jest.fn().mockResolvedValue({ id, title: 'Updated video' });
    upload = jest.fn();
    Object.assign(controller, {
      updateUseCase: { execute: update },
      getUseCase: { execute: get },
      uploadAudioVideoMedia: { execute: upload },
    });
  });

  it.each([undefined, {}])('updates JSON without files (%p)', async (files) => {
    await expect(
      controller.update(id, { title: 'Updated video' }, files as any),
    ).resolves.toEqual({ id, title: 'Updated video' });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ id, title: 'Updated video' }),
    );
    expect(get).toHaveBeenCalledWith({ id });
    expect(upload).not.toHaveBeenCalled();
  });

  it('rejects invalid JSON before updating', async () => {
    await expect(
      controller.update(id, { duration: -1 }, undefined as any),
    ).rejects.toMatchObject({ status: 422 });
    expect(update).not.toHaveBeenCalled();
  });

  it('rejects data and files together before updating', async () => {
    await expect(
      controller.update(id, { title: 'Updated video' }, { video: [{} as any] }),
    ).rejects.toMatchObject({ status: 400 });
    expect(update).not.toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();
  });
});
