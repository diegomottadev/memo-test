import { describe, expect, it, vi } from 'vitest';
import createApi, { API_METHODS } from './createApi';
import { ApiError } from './graphqlRequest';

const fakeImplementation = (result) =>
  Object.fromEntries(API_METHODS.map((method) => [method, vi.fn().mockResolvedValue(result)]));

const unavailable = () => new ApiError('Could not connect to the server', { unavailable: true });

function setup({ useServer = true } = {}) {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  const httpApi = fakeImplementation('from server');
  const mockApi = fakeImplementation('from mock');
  return { api: createApi({ useServer, httpApi, mockApi }), httpApi, mockApi };
}

describe('createApi', () => {
  it('uses the server while it answers', async () => {
    const { api, mockApi } = setup();
    await expect(api.getMemoTests()).resolves.toBe('from server');
    expect(api.getDataSource()).toBe('server');
    expect(mockApi.getMemoTests).not.toHaveBeenCalled();
  });

  it('uses the mocks from the start when there is no server', async () => {
    const { api, httpApi } = setup({ useServer: false });
    await expect(api.getMemoTests()).resolves.toBe('from mock');
    expect(api.getDataSource()).toBe('mock');
    expect(httpApi.getMemoTests).not.toHaveBeenCalled();
  });

  it('runs the same call on the mocks when the server is not available', async () => {
    const { api, httpApi, mockApi } = setup();
    httpApi.getMemoTest.mockRejectedValue(unavailable());

    await expect(api.getMemoTest({ id: '1' })).resolves.toBe('from mock');
    expect(mockApi.getMemoTest).toHaveBeenCalledWith({ id: '1' });
    expect(api.getDataSource()).toBe('fallback');
  });

  it('keeps using the mocks after the switch and tells the subscribers once', async () => {
    const { api, httpApi } = setup();
    const listener = vi.fn();
    api.subscribeDataSource(listener);
    httpApi.getMemoTests.mockRejectedValue(unavailable());

    await api.getMemoTests();
    await api.createGameSession({ memoTestId: '1' });

    expect(httpApi.createGameSession).not.toHaveBeenCalled();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('does not switch for GraphQL errors from the server', async () => {
    const { api, httpApi } = setup();
    const error = new ApiError('Invalid id');
    httpApi.getMemoTest.mockRejectedValue(error);

    await expect(api.getMemoTest({ id: 'x' })).rejects.toBe(error);
    expect(api.getDataSource()).toBe('server');
  });

  it('does not switch when the caller cancelled the request', async () => {
    const { api, httpApi } = setup();
    const controller = new AbortController();
    controller.abort();
    httpApi.getMemoTests.mockRejectedValue(unavailable());

    await expect(api.getMemoTests({ signal: controller.signal })).rejects.toBeInstanceOf(ApiError);
    expect(api.getDataSource()).toBe('server');
  });

  it('stops telling a listener after unsubscribe', async () => {
    const { api, httpApi } = setup();
    const listener = vi.fn();
    const unsubscribe = api.subscribeDataSource(listener);
    unsubscribe();
    httpApi.getMemoTests.mockRejectedValue(unavailable());

    await api.getMemoTests();
    expect(listener).not.toHaveBeenCalled();
  });
});
