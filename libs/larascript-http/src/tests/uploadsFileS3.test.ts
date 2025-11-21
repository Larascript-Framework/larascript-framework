import Controller from "@/http/base/Controller.js";
import { HTTP_ENVIRONMENT_DEFAULTS } from "@/http/config/environment.config.js";
import HttpContext from "@/http/context/HttpContext.js";
import HttpRouter from "@/http/router/HttpRouter.js";
import HttpS3Uploader from "@/http/services/HttpS3Uploader.js";
import { S3Service } from "@/http/services/S3Service.js";
import { beforeEach, describe } from "@jest/globals";
import { IUserModel } from "@larascript-framework/contracts/auth";
import { IHttpService, MiddlewareConstructor, TUploadedFileData } from "@larascript-framework/contracts/http";
import { clearOutputFiles, getOutputPath } from "@larascript-framework/test-helpers";
import 'dotenv/config';
import fs from "fs";
import { HttpEnvironment } from "../http/environment/HttpEnvironment.js";
import { createMockAuthorizeUserMiddleware } from "./helpers/createMockAuthorizeUserMiddleware.js";
import { TestHttpEnvironment } from "./helpers/TestHttpEnvironment.js";
import { resetMockModelTable } from "./repository/resetMockModelTable.js";

describe("uploads file s3 test suite", () => {
  let httpService: IHttpService;
  let serverPort: number;
  let user: IUserModel;
  let MockAuthorizeMiddleware: MiddlewareConstructor;
  let formData: FormData;
  let s3: AWS.S3;
  let allowS3Tests = process.env.ALLOW_S3_TESTS === 'true';

  beforeEach(async () => {
    await TestHttpEnvironment.create({
      databaseConfigured: true,
      dependencies: {
        ...HTTP_ENVIRONMENT_DEFAULTS.dependencies,
        uploadService: new HttpS3Uploader({
          tempUploadsDirectory: HTTP_ENVIRONMENT_DEFAULTS.uploadDirectory,
          bucketName: process.env.S3_BUCKET ?? '',
          region: process.env.S3_REGION ?? '',
          accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
        }),
      },
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

    s3 = S3Service.getS3(process.env.AWS_ACCESS_KEY_ID ?? '', process.env.AWS_SECRET_ACCESS_KEY ?? '', process.env.S3_REGION ?? '');
  });

  describe("uploads", () => {
    test("should be able to upload a file", async () => {
      if (!allowS3Tests) {
        console.warn('S3 tests are not allowed, set ALLOW_S3_TESTS=true to run');
        return;
      }

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

      const signedUrl = await s3.getSignedUrl('getObject', {
        Bucket: process.env.S3_BUCKET ?? '',
        Key: body.file.data.filename as string,
      });

      expect(response.status).toBe(200);
      expect(body.file.data.filename).toEqual('test.txt');
      expect(body.file.data.mimetype).toEqual('text/plain');
      expect(typeof signedUrl === 'string').toBe(true);
      expect(signedUrl).toContain(`https://${process.env.S3_BUCKET ?? ''}.s3.${process.env.S3_REGION ?? ''}.amazonaws.com/${body.file.data.filename}`);
    })

    test("should handle multiple files", async () => {
      if (!allowS3Tests) {
        console.warn('S3 tests are not allowed, set ALLOW_S3_TESTS=true to run');
        return;
      }

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

      const signedUrl1 = await s3.getSignedUrl('getObject', {
        Bucket: process.env.S3_BUCKET ?? '',
        Key: body.files[0].data.filename as string,
      });
      const signedUrl2 = await s3.getSignedUrl('getObject', {
        Bucket: process.env.S3_BUCKET ?? '',
        Key: body.files[1].data.filename as string,
      });

      expect(response.status).toBe(200);
      expect(body.files.length).toBe(2);
      expect(body.files[0].data.filename).toEqual('test.txt');
      expect(body.files[1].data.filename).toEqual('test2.txt');

      expect(typeof signedUrl1 === 'string').toBe(true);
      expect(typeof signedUrl2 === 'string').toBe(true);
      expect(signedUrl1).toContain(`https://${process.env.S3_BUCKET ?? ''}.s3.${process.env.S3_REGION ?? ''}.amazonaws.com/${body.files[0].data.filename}`);
      expect(signedUrl2).toContain(`https://${process.env.S3_BUCKET ?? ''}.s3.${process.env.S3_REGION ?? ''}.amazonaws.com/${body.files[1].data.filename}`);
    })
  });
});
