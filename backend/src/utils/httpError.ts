// Custom error class for handling HTTP errors with status code and optional metadata
class HttpError extends Error {
  statusCode: number;
  details: unknown;

  constructor(statusCode: number, message: string, details: unknown = null) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.details = details;
  }

  // TODO: fix prototype chain so instance of HttpError works correctly after transpilation
}

export default HttpError;
