# Coding Standards

### Naming Convetion Casing
- **Preferred casing for methods, variables:** camelCase
- **Preferred casing for classes, interfaces and types, objects**: PascalCase


### Domains

- Features ideally should be self contained in app/domains or core/domains.

- More generic utility functions and helpers can sit outside of a domain.

- Interfaces should be used when interacting with classes and methods outside of it's self contained domain.

### Classes, Types and Interfaces, Objects

- Classes, Interfaces, Types should be PascalCase. Example: `MyService.ts`

- Interfaces should start with a capital "i". Example: `IMyServiceInterface.ts`

- Type files should be suffixed with ".t.ts" Example: `Types.t.ts`

- Files that export Objects should follow PascelCase. Example: `MyObject.ts`

**Service/Interface Example:**

Filename: `MyService.ts`

```ts
class MyService implements IMyService
{
    public myServiceMethod({ data }: MyServiceMethodArgs): array
    {
        /* logic */    
    }
}

```

**Type Example:**

Filename: `MyServiceTypes.t.ts`

```ts
export type MyServiceMethodArgs = {
    data: array;
}
```

### Methods and variables

- Method file names should follow camelCasing.

- Method and variables should follow camelCasing.

Example:

Filename: `myServiceMethod.ts`

```ts

const myServiceMethod = () => { 
    /* logic */
}

export default myServiceMethod
```

```ts
import myServiceMethod from 'myServiceMethod'

const resultArray = myServiceMethod()
```



## Import Standards
- All internal imports should use absolute pathing and one of available prefixes.

- Prefixes available:
    - `@src` -> `/src`

Example
```ts
import MyService from '@src/domains/MyFeature/services/MyService';
import MongoDB from '@src/database/mongodb/services/MongoDB';
```

## Example Folder Structure

```
├── app/
│   ├── commands/
│   ├── events/
│   ├── models/
│   ├── observers/
│   ├── providers/
│   ├── repositories/
│   ├── routes/
│   ├── utils/
│   │   ├── formatString.ts
│   │   └── formatNumber.ts
│   └── domains/
│       ├── user/
│       │   ├── factory/
│       │   │   └── UserFactory.ts
│       │   ├── repository/
│       │   │   └── UserRepository.ts
│       │   ├── models/
│       │   │   └── User.ts
│       │   ├── services/
│       │   │   └── UserService.ts
│       │   └── types/
│       │       └── user.t.ts
│       └── movie/
│           ├── factory/
│           │   └── MovieFactory.ts
│           ├── repository/
│           │   └── MovieRepository.ts
│           ├── exceptions/
│           │   └── fetchMovieException.ts
│           ├── interfaces/
│           │   └── IMovie.ts
│           ├── services/
│           │   └── MovieDescriptionService.ts
│           └── types/
│               └── MovieTypes.t.ts
├── core/
│   ├── domains/
│   │   └── database/
│   │       └── mongodb/
│   │           ├── services/
│   │           ├── interfaces/
│   │           ├── relationships/
│   │           └── exceptions/
│   └── make/
│       ├── base/
│       ├── commands/
│       ├── providers/
│       └── templates/
└── config/
    └── app.ts
```
