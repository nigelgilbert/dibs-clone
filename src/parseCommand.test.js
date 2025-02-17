const parseCommand = require("./parseCommand");

describe("parseCommand", () => {
  it("parses a well formatted command", async () => {
    const command = "on staging for 5 minutes";
    const result = parseCommand(command);
    expect(result[1]).toBe("staging");
    expect(result[2]).toBe("5 minutes");
  });

  it("parses a command with a lot of whitespace", async () => {
    const command = "on     staging     for     5   minutes";
    const result = parseCommand(command);
    expect(result[1]).toBe("staging");
    expect(result[2]).toBe("5 minutes");
  });
});
