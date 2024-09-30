class HandlerError extends Error {
  public status: string
  public errors: string[]
  
  constructor(status, message, errors = []) {
    super(message);
    this.status = status
    this.errors = errors
  }
}

export {HandlerError}