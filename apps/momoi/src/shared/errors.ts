export interface AppError<T extends number = number> {
  message: string;
  code: T;
}

export class BaseError extends Error implements AppError<number> {
  code: number;

  constructor(message: string, code = 400) {
    super(message);
    this.code = code;
    this.message = message;
  }
}

export class BadRequestError extends BaseError implements AppError<400> {
  declare code: 400;

  constructor(message: string) {
    super(message, 400);
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class NotFoundError extends BaseError implements AppError<404> {
  declare code: 404;

  constructor(message: string) {
    super(message, 404);
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class ForbiddenError extends BaseError implements AppError<403> {
  declare code: 403;

  constructor(message: string) {
    super(message, 403);
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class InternalServerError extends BaseError implements AppError<500> {
  declare code: 500;

  constructor(message: string) {
    super(message, 500);
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class UnauthorizedError extends BaseError implements AppError<401> {
  declare code: 401;

  constructor(message: string) {
    super(message, 401);
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class ConflictError extends BaseError implements AppError<409> {
  declare code: 409;

  constructor(message: string) {
    super(message, 409);
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class UnprocessableEntityError extends BaseError implements AppError<422> {
  declare code: 422;

  constructor(message: string) {
    super(message, 422);
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class ServiceUnavailableError extends BaseError implements AppError<503> {
  declare code: 503;

  constructor(message: string) {
    super(message, 503);
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class GatewayTimeoutError extends BaseError implements AppError<504> {
  declare code: 504;

  constructor(message: string) {
    super(message, 504);
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class NotImplementedError extends BaseError implements AppError<501> {
  declare code: 501;

  constructor(message: string) {
    super(message, 501);
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class BadGatewayError extends BaseError implements AppError<502> {
  declare code: 502;

  constructor(message: string) {
    super(message, 502);
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class ConflictResourceError extends BaseError implements AppError<409> {
  declare code: 409;
  resource: string;

  constructor(message: string, resource: string) {
    super(message, 409);
    this.resource = resource;
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
      resource: this.resource,
    };
  }
}
