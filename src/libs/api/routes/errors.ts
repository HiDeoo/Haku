import StatusCode from 'status-code-enum'

export const API_ERROR_UNKNOWN = 'Something went wrong!'

export const API_ERROR_EMAIL_ALREADY_EXISTS = 'This email already exists.'
export const API_ERROR_EMAIL_DOES_NOT_EXISTS = 'This email does not exist.'

export const API_ERROR_FOLDER_PARENT_DOES_NOT_EXIST = 'The parent folder specified does not exist.'
export const API_ERROR_FOLDER_PARENT_INVALID_TYPE = 'The parent folder type is invalid.'
export const API_ERROR_FOLDER_ALREADY_EXISTS = 'A folder with the same name already exists.'
export const API_ERROR_FOLDER_DOES_NOT_EXIST = 'The folder specified does not exist.'
export const API_ERROR_FOLDER_INVALID_TYPE = 'The folder type is invalid.'

export const API_ERROR_NOTE_ALREADY_EXISTS = 'A note with the same name already exists.'
export const API_ERROR_NOTE_DOES_NOT_EXIST = 'The note specified does not exist.'
export const API_ERROR_NOTE_HTML_OR_TEXT_MISSING = 'The note html or text content is missing.'

export const API_ERROR_TODO_ALREADY_EXISTS = 'A todo with the same name already exists.'
export const API_ERROR_TODO_DOES_NOT_EXIST = 'The todo specified does not exist.'

export class ApiError extends Error {
  constructor(public message: string, public httpStatusCode: StatusCode = StatusCode.ClientErrorForbidden) {
    super(message)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export interface ApiErrorResponse {
  error: string
}
