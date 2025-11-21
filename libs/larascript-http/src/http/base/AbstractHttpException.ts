export abstract class AbstractHttpException extends Error {
    abstract code: number;
}