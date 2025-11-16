## Configuration

The HTTP configuration is used to configure the HTTP service.

- `enabled`: boolean
- `port`: number
- `beforeAllMiddlewares`: (Express or class)[]
- `afterAllMiddlewares`: (Express or class)[]
- `extendExpress`: (app: express.Application) => void
- `errorHandlers`: { notFoundHandler: (req: Request, res: Response, next: NextFunction) => void, errorHandler: (err: Error, req: Request, res: Response, next: NextFunction) => void }

### Example

```ts
import { IHttpServiceConfig } from '@larascript-framework/contracts/http';
import { HttpEnvironment, HttpService } from '@larascript-framework/larascript-http';

export const config: IHttpServiceConfig = {
    enabled: true,
    port: 5000,
    beforeAllMiddlewares: [],
    afterAllMiddlewares: [],
    extendExpress: () => {},
    logging: {
        requests: true,
    },

    // Optionally, you can configure the error handlers
    errorHandlers: {
        notFoundHandler: (req, res, next) => {
            res.status(404).send({ error: 'Route not found' });
        },
        errorHandler: (err, req, res, next) => {
            res.status(500).send({ error: 'Internal server error' });
        },
    }
}

await HttpEnvironment.create(
    new HttpService(config)
).boot();
```


