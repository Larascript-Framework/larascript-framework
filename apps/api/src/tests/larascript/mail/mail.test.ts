import { app } from "@/core/services/App.js";
import testHelper from "@/tests/testHelper.js";
import { describe, expect, test } from "@jest/globals";
import { Kernel } from "@larascript-framework/bootstrap";
import { Mail } from "@larascript-framework/larascript-mail";

describe("attempt to run app with normal appConfig", () => {
  beforeAll(async () => {
    Kernel.reset()
    await testHelper.testBootApp()
  });

  test("should be able to send mail to the local driver", async () => {

    const mail = new Mail()
    mail.setTo('john.smith@example.com')
    mail.setFrom('jane.smith@example.com')
    mail.setSubject('test subject')
    mail.setBody('test body')

    expect(() => app('mail').getDriver('local').send(mail)).not.toThrow()
  })
});
