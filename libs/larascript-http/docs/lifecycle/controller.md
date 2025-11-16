# Controllers

Controllers in the Larascript HTTP package are responsible for handling incoming HTTP requests, processing them, and returning appropriate responses. They act as an intermediary between the routes and the business logic of your application.

## Creating a Controller

To create a controller, define a TypeScript class that includes methods corresponding to the actions you want to handle. Each method should accept a request and response object, similar to Express.js handlers.

```typescript
import { HttpContext } from '@larascript-framework/larascript-http';

class UsersController {
  public async getUsers(context: HttpContext): Promise<void> {
    // Logic to retrieve users
    this.jsonResponse({ users: [] });
  }

  public async createUser(context: HttpContext): Promise<void> {
    // Logic to create a new user
    this.jsonResponse({ message: 'User created' });
  }
}

export default UsersController;
```

## Using Controllers with Routes

Controllers are typically used in conjunction with the routing system. You can specify a controller and its method when defining a route.

```typescript
import HttpRouter from '@/http/router/HttpRouter';
import UsersController from '@/http/controllers/UsersController';

const router = new HttpRouter();
router.get('/users', [UserController, 'getUsers']);
router.post('/users', [UserController, 'createUser']);
```

## Single Action Controllers

If you only need to handle a single action, you can define a controller class with the `invoke` method.

```typescript
import { HttpContext } from '@larascript-framework/larascript-http';

export class UserController {
    async invoke(context: HttpContext) {
        this.jsonResponse({ message: 'User created' });
    }
}
```

You can then use this controller in your routes without defining the method:

```typescript
import { HttpRouter } from '@larascript-framework/larascript-http';
import { UserController } from './UserController';

const router = new HttpRouter();
router.get('/users', UserController);

router.listen();
```

## Recommended Practices

- **Single Responsibility**: Each controller should focus on a specific part of your application, such as user management or order processing.
- **Reusability**: Extract common logic into services or utilities to keep controllers clean and focused.
- **Error Handling**: Always wrap your controller methods in a try/catch block and handle errors appropriately. Otherwise your application will crash.

## Available Methods

The `Controller` class provides several methods to facilitate handling HTTP requests and responses:

| Method Signature                                                                 | Description                                                        |
|----------------------------------------------------------------------------------|--------------------------------------------------------------------|
| `getRouteOptions(): TRouteItem \| undefined`                                     | Retrieves the route item options.                                  |
| `render(view: string, data: Record<string, unknown>): void`                      | Sends a view response.                                             |
| `jsonResponse(data: object, code: number = 200): void`                           | Sends a JSON response with a specified status code.                |
| `ok(data: object): void`                                                         | Sends a successful JSON response with a 200 status code.           |
| `created(data: object): void`                                                    | Sends a created JSON response with a 201 status code.              |
| `noContent(): void`                                                              | Sends a no content response with a 204 status code.                |
| `badRequest(message: string = 'Bad Request'): void`                              | Sends a bad request response with a 400 status code.               |
| `unauthorized(message: string = 'Unauthorized'): void`                           | Sends an unauthorized response with a 401 status code.             |
| `forbidden(message: string = 'Forbidden'): void`                                 | Sends a forbidden response with a 403 status code.                 |
| `notFound(message: string = 'Not Found'): void`                                  | Sends a not found response with a 404 status code.                 |
| `serverError(message: string \| Error \| undefined = 'Internal Server Error'): void` | Sends an internal server error response with a 500 status code.    |
| `redirect(url: string, statusCode: number = 302): void`                          | Redirects to a specified URL with a given status code.             |

## Conclusion

Controllers are a fundamental part of the Larascript HTTP package, enabling you to organize your application's logic and handle HTTP requests efficiently. By following best practices, you can create maintainable and scalable applications.
