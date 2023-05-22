import {ValidationError, Validator} from "jsonschema";
import {Request, Response} from "express";

export abstract class HTTPRequest {
    protected abstract schema: object;

    protected validator: Validator = new Validator();

    protected validateRequestBody(body: any): ValidationError[] {
        const validationResult = this.validator.validate(body, this.schema);
        return validationResult.errors;
    }

    protected isErrorWithStatusCode(error: unknown): error is { statusCode: number } {
        return typeof (error as { statusCode: number | undefined }).statusCode === 'number';
    }

    public handleRequest(req: Request, res: Response): void {
        const errors = this.validateRequestBody(req.body);
        if (errors.length > 0) {
            res.status(400).json({errors});
            return
        }
    }
}