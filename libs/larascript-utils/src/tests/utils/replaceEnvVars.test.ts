import { describe, expect, test } from "@jest/globals";
import { replaceEnvValue } from "../../utils/replaceEnvVars.js";

describe("replaceEnvValue", () => {
  describe("single occurrence", () => {
    test("should replace existing environment variable", () => {
      const content =
        "DATABASE_URL=mysql://localhost:3306/db\nAPI_KEY=old_key\nPORT=3000";
      const result = replaceEnvValue("API_KEY", "new_key", content);

      expect(result).toBe(
        "DATABASE_URL=mysql://localhost:3306/db\nAPI_KEY=new_key\nPORT=3000",
      );
    });

    test("should handle content with only one variable", () => {
      const content = "API_KEY=old_key";
      const result = replaceEnvValue("API_KEY", "new_key", content);

      expect(result).toBe("API_KEY=new_key");
    });
  });

  describe("multiple occurrences", () => {
    test("should replace all occurrences of the variable", () => {
      const content =
        "API_KEY=old_key\nDATABASE_URL=mysql://localhost:3306/db\nAPI_KEY=another_old_key";
      const result = replaceEnvValue("API_KEY", "new_key", content);

      expect(result).toBe(
        "API_KEY=new_key\nDATABASE_URL=mysql://localhost:3306/db\nAPI_KEY=new_key",
      );
    });
  });

  describe("variable not found", () => {
    test("should return original content when variable does not exist", () => {
      const content = "DATABASE_URL=mysql://localhost:3306/db\nPORT=3000";
      const result = replaceEnvValue("API_KEY", "new_key", content);

      expect(result).toBe(content);
    });
  });

  describe("edge cases", () => {
    test("should handle empty content", () => {
      const result = replaceEnvValue("API_KEY", "new_key", "");

      expect(result).toBe("");
    });

    test("should handle content with only whitespace", () => {
      const result = replaceEnvValue("API_KEY", "new_key", "   \n  ");

      expect(result).toBe("   \n  ");
    });

    test("should handle empty value", () => {
      const content = "API_KEY=old_key";
      const result = replaceEnvValue("API_KEY", "", content);

      expect(result).toBe("API_KEY=");
    });

    test("should handle special characters in value", () => {
      const content = "API_KEY=old_key";
      const result = replaceEnvValue(
        "API_KEY",
        "new_key_with_special_chars!@#$%",
        content,
      );

      expect(result).toBe("API_KEY=new_key_with_special_chars!@#$%");
    });
  });
});
