import express from "express";
import { WorkoutFilters, WorkoutRepository } from "./workoutRepository";
import qs from "qs";
import {
  errorResponse,
  numericalParameter,
  stringParameter,
  ValidationError,
} from "./expressUtils";
import { AI } from "./ai";

export function getServer(workoutRepository: WorkoutRepository, ai: AI) {
  const app = express();

  app.set("query parser", function (str: string) {
    return qs.parse(str, { duplicates: "last" });
  });

  app.get("/api/list-tags", function (req, res) {
    res.json(workoutRepository.listTags());
  });

  app.get("/api/workouts", function (req, res) {
    let filters: WorkoutFilters = {};
    if (req.query["tag"]) {
      filters = { ...filters, tag: stringParameter(req, res, "tag") };
    }
    if (req.query["searchName"]) {
      filters = {
        ...filters,
        searchName: stringParameter(req, res, "searchName"),
      };
    }
    if (req.query["durationMin"] || req.query["durationMax"]) {
      if (!(req.query["durationMin"] && req.query["durationMax"])) {
        errorResponse(res, "you must specify both durationMin and durationMax");
        return;
      }
      filters = {
        ...filters,
        durationMin: numericalParameter(req, res, "durationMin"),
        durationMax: numericalParameter(req, res, "durationMax"),
      };
    }
    if (req.query["duration"]) {
      filters = {
        ...filters,
        duration: numericalParameter(req, res, "duration"),
      };
    }

    res.json(workoutRepository.workouts(filters));
  });

  app.get("/api/workout/:workoutId", function (req, res) {
    if (!("workoutId" in req.params)) {
      errorResponse(res, "no workoutId");
      return;
    }

    const workout = workoutRepository.workout(req.params["workoutId"]);
    if (!workout) {
      res.status(404).json({});
      return;
    }

    res.json(workout);
  });

  app.get("/api/ai/suggested-workout", async function (req, res) {
    if (!req.query["heading"]) {
      errorResponse(res, "no heading");
      return;
    }

    const suggestedWorkout = await ai.suggestedWorkout(
      stringParameter(req, res, "heading"),
    );
    res.json(suggestedWorkout);
  });

  app.use(
    (
      err: Error,
      req: express.Request,
      res: express.Response,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      next: unknown,
    ) => {
      if (err instanceof ValidationError) {
        errorResponse(res, err.message);
        return;
      }

      console.error(err.stack);
      errorResponse(res, "Internal server error", 500);
    },
  );

  return {
    app,
    listen: (port: number) => {
      app.listen(port);
    },
  };
}
