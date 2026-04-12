// Custom error class for handling HTTP errors with status code and optional metadata
class HttpError extends Error {
  statusCode: number;
  details: any;

  constructor(statusCode: number, message: string, details: any = null) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.details = details;
  }

  // TODO: fix prototype chain so instance of HttpError works correctly after transpilation
}

export default HttpError;
