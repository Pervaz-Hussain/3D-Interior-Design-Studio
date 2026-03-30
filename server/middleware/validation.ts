import { z } from "zod";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware for validating request body using Zod schemas
 * 
 * @param schema Zod schema to validate against
 * @returns Express middleware function
 */
export function zValidate<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.body);
      req.body = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedError = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          message: "Validation error",
          errors: formattedError
        });
      }
      
      return res.status(400).json({
        message: "Invalid request data",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };
}

/**
 * Middleware for validating query parameters using Zod schemas
 * 
 * @param schema Zod schema to validate against
 * @returns Express middleware function
 */
export function zValidateQuery<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.query);
      req.query = result as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedError = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          message: "Validation error in query parameters",
          errors: formattedError
        });
      }
      
      return res.status(400).json({
        message: "Invalid query parameters",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };
}

/**
 * Middleware for validating URL parameters using Zod schemas
 * 
 * @param schema Zod schema to validate against
 * @returns Express middleware function
 */
export function zValidateParams<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.params);
      req.params = result as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedError = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          message: "Validation error in URL parameters",
          errors: formattedError
        });
      }
      
      return res.status(400).json({
        message: "Invalid URL parameters",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };
}
