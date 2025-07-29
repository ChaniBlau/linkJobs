export class HttpError extends Error {
  public status: number;

  constructor(message: string, status: number = 400) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
