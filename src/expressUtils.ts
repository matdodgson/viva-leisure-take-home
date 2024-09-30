import express from "express";

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

  errorResponse(res, `bad ${paramName}`);
  res.end();
  throw new Error("unreachable");
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

  errorResponse(res, `bad ${paramName}`);
  res.end();
  throw new Error("unreachable");
}
