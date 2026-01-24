import { Model } from "@/model/index.js";
import { testHelper } from "@/tests/tests-helper/testHelper.js";
import TestEncryptionModel, {
  resetEncryptionTable,
  TestEncryptionModelAttributes,
} from "./models/TestEncryptionModel.js";

describe("test model encryption", () => {
  beforeAll(async () => {
    await testHelper.testBootApp();
  });

  beforeEach(async () => {
    await resetEncryptionTable();
  });

  test("encrypt and decrypt field when saving and retrieving", async () => {
    // Create a model with a secret value
    const secretValue = "my-super-secret-value";
    const created = await TestEncryptionModel.create<TestEncryptionModel>({
      secret: secretValue,
    });
    await created.save();

    // Verify the stored value is encrypted (different from original)
    const mockEncryptedAttributes = (
      created as Model<TestEncryptionModelAttributes>
    ).encryptAttributes({
      secret: secretValue,
    } as TestEncryptionModelAttributes);
    expect(mockEncryptedAttributes?.secret).not.toBe(secretValue);

    // Retrieve the model from database
    const retrieved = await TestEncryptionModel.query().find(created.id);

    // Verify the decrypted value matches original
    expect(retrieved?.secret).toBe(secretValue);
  });

  test("updates encrypted field correctly", async () => {
    // Create initial model
    const created = await TestEncryptionModel.create<TestEncryptionModel>({
      secret: "initial-secret",
    });
    await created.save();

    // Update the secret
    const newSecret = "updated-secret";
    await created.setAttribute("secret", newSecret);
    await created.save();

    // Retrieve and verify updated value
    const retrieved = await TestEncryptionModel.query().find(created.id);
    expect(retrieved?.secret).toBe(newSecret);
  });

  test("handles null values in encrypted fields", async () => {
    const created = await TestEncryptionModel.create<TestEncryptionModel>({
      secret: null,
    });
    await created.save();

    const retrieved = await TestEncryptionModel.query().find(created.id);
    expect(retrieved?.secret).toBeNull();
  });
});
