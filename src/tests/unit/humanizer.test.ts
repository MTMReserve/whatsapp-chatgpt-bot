describe('Humanizer', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('delay should wait at least the given ms', async () => {
    const promise = Humanizer.delay(50);

    // avança o “relógio” virtual
    jest.advanceTimersByTime(50);

    await expect(promise).resolves.toBeUndefined();
  });
});
