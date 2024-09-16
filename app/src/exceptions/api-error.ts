class ApiError extends Error {
  public status: string
  public errors: string[]
  
  constructor(status, message, errors = []) {
    super(message);
    this.status = status
    this.errors = errors
  }
  
  static UnauthorizedError() {
    return new ApiError(401, 'Пользователь не авторизован')
  }
  
  static BadRequest(message, errors = []) {
    return new ApiError(400, message, errors)
  }
}

export {ApiError}