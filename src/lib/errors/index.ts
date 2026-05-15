import { Prisma } from '@prisma/client';

export interface AppError {
  code: string;
  message: string;
  statusCode: number;
  path?: string[];
}

const ERROR_MESSAGES: Record<string, string> = {
  P2002: 'Este valor ya existe en la base de datos',
  P2003: 'El registro relacionado no existe',
  P2011: 'Falta un campo requerido',
  P2014: 'El cambio que intenta realizar no es válido',
  P2019: 'Error de validación de entrada',
  P2025: 'El registro no fue encontrado',
  
  AUTH_INVALID_TOKEN: 'El token de autenticación es inválido o ha expirado',
  AUTH_TOKEN_EXPIRED: 'El token ha expirado, por favor inicie sesión nuevamente',
  AUTH_INVALID_CREDENTIALS: 'Credenciales inválidas',
  AUTH_USER_NOT_FOUND: 'Usuario no encontrado',
  AUTH_USER_DISABLED: 'La cuenta de usuario ha sido deshabilitada',
  AUTH_SESSION_EXPIRED: 'La sesión ha expirado, por favor inicie sesión nuevamente',
  
  CART_ITEM_NOT_FOUND: 'El item del carrito no fue encontrado',
  CART_NOT_FOUND: 'El carrito no fue encontrado',
  CART_EMPTY: 'El carrito está vacío',
  INSUFFICIENT_STOCK: 'Stock insuficiente para completar la operación',
  
  PRODUCT_NOT_FOUND: 'Producto no encontrado',
  PRODUCT_UNAVAILABLE: 'El producto no está disponible',
  
  ORDER_NOT_FOUND: 'Pedido no encontrado',
  ORDER_INVALID_STATUS: 'El estado del pedido no permite esta operación',
  
  VALIDATION_ERROR: 'Error de validación',
  INTERNAL_ERROR: 'Error interno del servidor',
};

const HTTP_STATUS_CODES: Record<string, number> = {
  P2002: 409,
  P2003: 400,
  P2011: 400,
  P2014: 400,
  P2019: 400,
  P2025: 404,
  
  AUTH_INVALID_TOKEN: 401,
  AUTH_TOKEN_EXPIRED: 401,
  AUTH_INVALID_CREDENTIALS: 401,
  AUTH_USER_NOT_FOUND: 404,
  AUTH_USER_DISABLED: 403,
  AUTH_SESSION_EXPIRED: 401,
  
  CART_ITEM_NOT_FOUND: 404,
  CART_NOT_FOUND: 404,
  CART_EMPTY: 400,
  INSUFFICIENT_STOCK: 400,
  
  PRODUCT_NOT_FOUND: 404,
  PRODUCT_UNAVAILABLE: 400,
  
  ORDER_NOT_FOUND: 404,
  ORDER_INVALID_STATUS: 400,
  
  VALIDATION_ERROR: 400,
  INTERNAL_ERROR: 500,
};

export function translatePrismaError(error: Prisma.PrismaClientKnownRequestError): AppError {
  const code = error.code || 'INTERNAL_ERROR';
  const message = ERROR_MESSAGES[code] || ERROR_MESSAGES.INTERNAL_ERROR;
  const statusCode = HTTP_STATUS_CODES[code] || 500;

  return {
    code,
    message,
    statusCode,
    path: error.meta?.target as string[] | undefined,
  };
}

export function handleAppError(error: unknown): AppError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return translatePrismaError(error);
  }

  if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error && 'statusCode' in error) {
    return error as AppError;
  }

  if (error instanceof Error) {
    const message = error.message;
    
    for (const [code, msg] of Object.entries(ERROR_MESSAGES)) {
      if (msg === message) {
        return {
          code,
          message,
          statusCode: HTTP_STATUS_CODES[code] || 500,
        };
      }
    }

    return {
      code: 'INTERNAL_ERROR',
      message,
      statusCode: 500,
    };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    statusCode: 500,
  };
}

export function createAppError(code: string, message?: string, statusCode?: number): AppError {
  return {
    code,
    message: message || ERROR_MESSAGES[code] || 'Error desconocido',
    statusCode: statusCode || HTTP_STATUS_CODES[code] || 500,
  };
}

export function formatGraphQLErrors(errors: AppError[]): Array<{ code: string; message: string; path?: string[] }> {
  return errors.map((err) => ({
    code: err.code,
    message: err.message,
    path: err.path,
  }));
}
