import express from "express";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function errorResponse(
  res: express.Response,
  error: string,
  statusCode: number = 400,
) {
  res.status(statusCode).json({ error });
}

export function stringParameter(
  req: express.Request,
  res: express.Response,
  paramName: string,
): string {
  if (typeof req.query[paramName] === "string") {
    return req.query[paramName];
  }

  throw new ValidationError(`bad ${paramName}`);
}

export function numericalParameter(
  req: express.Request,
  res: express.Response,
  paramName: string,
): number {
  const stringValue = stringParameter(req, res, paramName);
  const numericalValue = parseInt(stringValue);
  if (!isNaN(numericalValue)) {
    return numericalValue;
  }

  throw new ValidationError(`bad ${paramName}`);
}
