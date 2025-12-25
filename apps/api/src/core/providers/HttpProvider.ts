import httpConfig from "@/config/http.config.js";
import { routesConfig } from "@/config/routes.config.js";
import { AbstractProvider } from "@larascript-framework/bootstrap";
import {
  IHttpServiceConfig,
  IHttpUploadService,
  IRouter,
} from "@larascript-framework/contracts/http";
import {
  HttpEnvironment,
  HttpFileSystemUploader,
  HttpS3Uploader,
  HttpService,
} from "@larascript-framework/larascript-http";
import expressLayouts from "express-ejs-layouts";
import path from "path";
import { app } from "../services/App.js";

export default class HttpProvider extends AbstractProvider {
  private httpService!: HttpService;

  private routesConfig: () => IRouter[] = routesConfig;

  /**
   * The configuration for the Express provider
   *
   * @default httpConfig
   */
  protected config: IHttpServiceConfig = httpConfig;

  /**
   * Register method
   * Called when the provider is being registered
   * Use this method to set up any initial configurations or services
   *
   * @returns Promise<void>
   */
  public async register(): Promise<void> {

    const httpService = new HttpService(this.config);

    /**
     * Setup view engine, views, layouts directories
     */
    httpService.getExpress().set("view engine", "ejs");
    httpService
      .getExpress()
      .set(
        "views",
        path.join(process.cwd(), "src", "app", "resources", "views"),
      );
    httpService.getExpress().use(expressLayouts);
    httpService
      .getExpress()
      .set(
        "layout",
        path.join(
          process.cwd(),
          "src",
          "app",
          "resources",
          "layouts",
          "base-view.ejs",
        ),
      );

    /**
     * Setup routes
     */
    for (const route of this.routesConfig()) {
      httpService.useRouter(route);
    }

    let uploadService!: IHttpUploadService;
    if (this.config.uploads.driver === "filesystem") {
      uploadService = new HttpFileSystemUploader({
        uploadsDirectory: this.config.uploads.config.filesystem
          ?.uploadsDirectory as string,
      });
    } else if (this.config.uploads.driver === "s3") {
      uploadService = new HttpS3Uploader({
        tempUploadsDirectory: this.config.uploads.config.s3
          ?.tempUploadsDirectory as string,
        bucketName: this.config.uploads.config.s3?.bucketName as string,
        region: this.config.uploads.config.s3?.region as string,
        accessKeyId: this.config.uploads.config.s3?.accessKeyId as string,
        secretAccessKey: this.config.uploads.config.s3
          ?.secretAccessKey as string,
      });
    } else {
      throw new Error(
        "Unexepected http uploads driver value: '" + this.config.uploads.driver,
      );
    }

    // Create the HttpEnvironment
    HttpEnvironment.create(httpService, {
      authConfigured: true,
      databaseConfigured: true,
      dependencies: {
        loggerService: app("logger"),
        uploadService: uploadService,
      },
    });

    this.bind("http", HttpEnvironment.getInstance().httpService);
  }

  /**
   * Boot the Express provider
   *
   * @returns Promise<void>
   */
  public async boot(): Promise<void> {
    await HttpEnvironment.getInstance().boot();

    // Log that Express is successfully listening
    app("logger").info(
      "Express successfully listening on port " +
        HttpEnvironment.getInstance().httpService.getConfig()?.port,
    );
  }
}
