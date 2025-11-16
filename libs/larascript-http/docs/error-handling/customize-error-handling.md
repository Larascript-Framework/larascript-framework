## Customize Error Handling

By default, the package will handle 404 and 500 errors automatically.

However, if you wish to customize the error handling, you can do so by providing a custom error handler in the HTTP service configuration.

```ts
export const config: IHttpServiceConfig = {
    // ...
    errorHandlers: {
        notFoundHandler: (req, res, next) => {
            res.status(404).send({ error: 'Route not found' });
        },
        errorHandler: (err, req, res, next) => {
            res.status(500).send({ error: 'Internal server error' });
        },
    }
}
```