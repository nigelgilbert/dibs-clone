const { reserveResource, eventEmitter, Events } = require("./ResourceQueue");

describe("reserveResource", () => {
  // Cleanup listeners to avoid memory leaks
  afterEach(() => eventEmitter.removeAllListeners())
  
  it("Emits a `RESERVED` event when a user reserves a resource", (done) => {
    const mockHandler = jest.fn();
    eventEmitter.on(Events.RESERVED, mockHandler);
    reserveResource("resource-1", "user", "channel", 100);
    expect(mockHandler).toHaveBeenCalledOnce();
    setTimeout(() => done(), 200);
  });

  it("Emits a `QUEUED` event when a 2nd user reserves a resource", (done) => {
    const mockHandler = jest.fn();
    eventEmitter.on(Events.QUEUED, mockHandler);
    reserveResource("resource-2", "first", "channel", 100);
    reserveResource("resource-2", "second", "channel", 100);
    expect(mockHandler).toHaveBeenCalledOnce();
    setTimeout(() => done(), 200);
  });

  it("Emits a `RELEASED` event when user releases a resource", (done) => {
    const mockHandler = jest.fn();
    eventEmitter.on(Events.RELEASED, mockHandler);
    reserveResource("resource-3", "user", "channel", 100);
    expect(mockHandler).toHaveBeenCalledOnce();
    setTimeout(() => done(), 150);
  });
});
