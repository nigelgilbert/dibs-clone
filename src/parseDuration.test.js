const parseDuration = require("./parseDuration");

describe("parseDuration", () => {
  it("parses minute durations", async () => {
    const cases = ["1 minute", "5 minutes"];
    const results = [60000, 300000];
    cases.forEach(async (value, index) => {
      const duration = await parseDuration(value);
      expect(duration).toBe(results[index]);
    });
  });

  it("parses hour durations", async () => {
    const cases = ["1 hour", "2 hours"];
    const results = [3600000, 7200000];
    cases.forEach(async (value, index) => {
      const duration = await parseDuration(value);
      expect(duration).toBe(results[index]);
    });
  });

  it("parses combined hour & minute durations", async () => {
    const cases = ["1 hour 30 minutes", "1 hour 45 minutes"];
    const results = [5400000, 6300000];
    cases.forEach(async (value, index) => {
      const duration = await parseDuration(value);
      expect(duration).toBe(results[index]);
    });
  });
});
