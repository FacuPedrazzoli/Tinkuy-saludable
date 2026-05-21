export interface GQLError {
  code: string;
  message: string;
  path?: string[];
}

export interface GQLResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: GQLError[];
}

export function successResponse<T>(data: T, message?: string): GQLResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function errorResponse(errors: GQLError[], message?: string): GQLResponse<null> {
  return {
    success: false,
    errors,
    message: message || 'An error occurred',
  };
}

export function singleError(code: string, message: string, path?: string[]): GQLResponse<null> {
  return {
    success: false,
    errors: [{ code, message, path }],
    message,
  };
}
