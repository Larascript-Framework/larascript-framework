import { describe, expect, test } from "@jest/globals";
import AsyncSessionService from "../session/AsyncSessionService.js";

describe("SessionService", () => {
  test("should create a new session with unique ID", async () => {
    const sessionService = new AsyncSessionService();
    await sessionService.start();
    const session = sessionService.createSession();

    expect(session).toBeDefined();
    expect(session.id).toBeDefined();
    expect(typeof session.id).toBe("string");
    expect(session.data).toEqual({});
  });

  test("should throw error when getting session without creating one", () => {
    const sessionService = new AsyncSessionService();
    expect(() => {
      sessionService.getSession();
    }).toThrow("No session found in current context");
  });

  test("should get session after creating one", async () => {
    const sessionService = new AsyncSessionService();
    await sessionService.runWithSession(async () => {
      const retrievedSession = sessionService.getSession();

      expect(retrievedSession).toBeDefined();
      expect(retrievedSession?.id).toBe(retrievedSession.id);
      expect(retrievedSession?.data).toEqual({});
    });
  });

  test("should get session ID", async () => {
    const sessionService = new AsyncSessionService();
    await sessionService.runWithSession(async () => {
      const sessionId = sessionService.getSessionId();

      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe("string");
    });
  });

  test("should get and set session data", async () => {
    const sessionService = new AsyncSessionService();
    await sessionService.runWithSession(async () => {
      const testData = { user: "test", role: "admin" };
      sessionService.setSessionData(testData);

      const sessionData = sessionService.getSessionData();
      expect(sessionData).toEqual(testData);
    });
  });

  test("should update session data while preserving existing values", async () => {
    const sessionService = new AsyncSessionService();
    await sessionService.runWithSession(async () => {
      // Set initial data
      const initialData = { user: "test", role: "admin" };
      sessionService.setSessionData(initialData);

      // Update with new data
      const updateData = { role: "user", email: "test@example.com" };
      sessionService.updateSessionData(updateData);

      // Check that new data is merged with existing data
      const sessionData = sessionService.getSessionData();
      expect(sessionData).toEqual({
        user: "test",
        role: "user",
        email: "test@example.com",
      });
    });
  });

  test("should throw error when setting data without active session", async () => {
    const sessionService = new AsyncSessionService();
    const testData = { user: "test" };

    expect(() => {
      sessionService.setSessionData(testData);
    }).toThrow("No session found in current context");
  });
});
