## Validation Middleware

The Validation Middleware is used to validate the request body against the validator constructor.

### Example Validator 

```ts
export class validatorConstructor extends BaseCustomValidator {
    protected rules: IRulesObject = {
        name: [new RequiredRule(), new StringRule()],
        email: [new RequiredRule(), new EmailRule(), new UniqueRule(User, 'email')],
        password: [new RequiredRule(), new StringRule()],
    }
}
```

### Example Route
```ts
router.post('/users', [UsersController, 'create'], {
    validator: [
        validatorConstructor
    ],
})
```

## Example Failed Response

Http Code: `422`

Body:

```json
{
    "errors": {
        "name": ["The name field is required."],
        "email": ["The email field is required."],
        "password": ["The password field is required."],
    }
}
```