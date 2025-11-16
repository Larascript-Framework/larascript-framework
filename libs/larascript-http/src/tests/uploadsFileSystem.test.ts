import Controller from "@/http/base/Controller.js";
import HttpContext from "@/http/context/HttpContext.js";
import HttpRouter from "@/http/router/HttpRouter.js";
import { beforeEach, describe } from "@jest/globals";
import { IUserModel } from "@larascript-framework/contracts/auth";
import { IHttpService, MiddlewareConstructor, TUploadedFileData } from "@larascript-framework/contracts/http";
import { clearOutputFiles, getOutputPath } from "@larascript-framework/test-helpers";
import fs from "fs";
import { HttpEnvironment } from "../http/environment/HttpEnvironment.js";
import { createMockAuthorizeUserMiddleware } from "./helpers/createMockAuthorizeUserMiddleware.js";
import { TestHttpEnvironment } from "./helpers/TestHttpEnvironment.js";
import { resetMockModelTable } from "./repository/resetMockModelTable.js";

describe("uploads test suite", () => {
  let httpService: IHttpService;
  let serverPort: number;
  let user: IUserModel;
  let MockAuthorizeMiddleware: MiddlewareConstructor;
  let formData: FormData;

  beforeEach(async () => {
    await TestHttpEnvironment.create({
      databaseConfigured: true,
    }).boot();

    httpService = HttpEnvironment.getInstance().httpService;

    await resetMockModelTable();

    user = await HttpEnvironment.getInstance().authEnvironment.userCreationService.createAndSave({
      email: 'test@test.com',
      password: 'password'
    })
    MockAuthorizeMiddleware = createMockAuthorizeUserMiddleware(user);

    serverPort = httpService.getPort()!; 1

    clearOutputFiles();

    // Create a test file
    fs.writeFileSync(getOutputPath('test.txt'), 'test');

  });

  describe("uploads", () => {
    test("should be able to upload a file", async () => {
      formData = new FormData();
      const fileBuffer = fs.readFileSync(getOutputPath('test.txt'));
      formData = new FormData();
      formData.append('file', new File([fileBuffer], 'test.txt', { type: 'text/plain' }));

      const controller = class extends Controller {
        async invoke(context: HttpContext) {
          const file = context.getFile('file');

          if (!file) {
            throw new Error('File not found');
          }

          await context.uploadFile(file)

          this.jsonResponse({
            file: file,
          }, 200)
        }
      }

      const router = new HttpRouter();
      router.post('/upload', controller);
      httpService.useRouterAndApply(router);

      const response = await fetch(`http://localhost:${serverPort}/upload`, {
        method: 'POST',
        body: formData,
      })

      const body = await response.json() as {
        file: {
          data: Partial<TUploadedFileData>
        }
      }
      expect(response.status).toBe(200);
      expect(body.file.data.filename).toEqual('test.txt');
      expect(body.file.data.mimetype).toEqual('text/plain');
    })

    test("should handle multiple files", async () => {
      formData = new FormData();
      const fileBuffer = fs.readFileSync(getOutputPath('test.txt'));
      formData = new FormData();
      formData.append('file', new File([fileBuffer], 'test.txt', { type: 'text/plain' }));
      formData.append('file', new File([fileBuffer], 'test2.txt', { type: 'text/plain' }));

      const controller = class extends Controller {
        async invoke(context: HttpContext) {
          const files = context.getFiles('file');

          if (!files) {
            throw new Error('Files not found');
          }

          await context.uploadFiles(files);

          this.jsonResponse({
            files: files,
          }, 200)
        }
      }

      const router = new HttpRouter();
      router.post('/upload', controller);
      httpService.useRouterAndApply(router);

      const response = await fetch(`http://localhost:${serverPort}/upload`, {
        method: 'POST',
        body: formData,
      })

      const body = await response.json() as {
        files: {
          data: Partial<TUploadedFileData>
        }[]
      }

      expect(response.status).toBe(200);
      expect(body.files.length).toBe(2);
      expect(body.files[0].data.filename).toEqual('test.txt');
      expect(body.files[1].data.filename).toEqual('test2.txt');
    })
  });
});
