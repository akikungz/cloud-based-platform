export interface AppError {
  message: string;
  code: number;
}

export class BadRequestError extends Error implements AppError {
  code: number;

  constructor(message: string, code = 400) {
    super(message);
    this.code = code;
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class NotFoundError extends Error implements AppError {
  code: number;

  constructor(message: string, code = 404) {
    super(message);
    this.code = code;
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class ForbiddenError extends Error implements AppError {
  code: number;

  constructor(message: string, code = 403) {
    super(message);
    this.code = code;
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class InternalServerError extends Error implements AppError {
  code: number;

  constructor(message: string, code = 500) {
    super(message);
    this.code = code;
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class UnauthorizedError extends Error implements AppError {
  code: number;

  constructor(message: string, code = 401) {
    super(message);
    this.code = code;
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class ConflictError extends Error implements AppError {
  code: number;

  constructor(message: string, code = 409) {
    super(message);
    this.code = code;
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class UnprocessableEntityError extends Error implements AppError {
  code: number;

  constructor(message: string, code = 422) {
    super(message);
    this.code = code;
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class ServiceUnavailableError extends Error implements AppError {
  code: number;

  constructor(message: string, code = 503) {
    super(message);
    this.code = code;
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class GatewayTimeoutError extends Error implements AppError {
  code: number;

  constructor(message: string, code = 504) {
    super(message);
    this.code = code;
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class NotImplementedError extends Error implements AppError {
  code: number;

  constructor(message: string, code = 501) {
    super(message);
    this.code = code;
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class BadGatewayError extends Error implements AppError {
  code: number;

  constructor(message: string, code = 502) {
    super(message);
    this.code = code;
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class ConflictResourceError extends Error implements AppError {
  code: number;
  resource: string;

  constructor(message: string, resource: string, code = 409) {
    super(message);
    this.code = code;
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
