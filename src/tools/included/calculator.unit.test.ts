// Calculator.test.ts
import calculator from "./calculator"; // Adjust the import path as necessary

describe("Calculator instance", () => {
  it("evaluates an addition expression", async () => {
    const result = await calculator.call({ expression: "2 + 2" });
    expect(result).toBe("4");
  });

  it("evaluates a subtraction expression", async () => {
    const result = await calculator.call({ expression: "5 - 2" });
    expect(result).toBe("3");
  });

  it("evaluates a multiplication expression", async () => {
    const result = await calculator.call({ expression: "3 * 3" });
    expect(result).toBe("9");
  });

  it("evaluates a division expression", async () => {
    const result = await calculator.call({ expression: "8 / 2" });
    expect(result).toBe("4");
  });

  it("handles invalid expressions by throwing an error", async () => {
    await expect(calculator.call({ expression: "invalid" })).rejects.toThrow();
  });
});
