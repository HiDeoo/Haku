import StatusCode from 'status-code-enum'

export * from 'constants/error'

export class ApiError extends Error {
  constructor(public message: string, public httpStatusCode: StatusCode = StatusCode.ClientErrorForbidden) {
    super(message)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export interface ApiErrorResponse {
  error: string
}
