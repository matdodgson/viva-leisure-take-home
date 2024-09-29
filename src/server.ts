import express from "express";
import { WorkoutFilters, WorkoutRepository } from "./workoutRepository";
import qs from "qs";

function errorResponse(res: express.Response, error: string, statusCode: number = 400) {
    res.status(statusCode).json({ error });
}

function stringParameter(req: express.Request, res: express.Response, paramName: string): string {
    if (typeof req.query[paramName] !== "string") {
        errorResponse(res, `bad ${paramName}`);
        res.end();
    }

    return req.query[paramName] as string;
}

function numericalParameter(req: express.Request, res: express.Response, paramName: string): number {
    const stringValue = stringParameter(req, res, paramName);
    const numericalValue = parseInt(stringValue);
    if (isNaN(numericalValue)) {
        errorResponse(res, `bad ${paramName}`);
        res.end();
    }

    return numericalValue;
}

export function server(workoutRepository: WorkoutRepository) {
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
            filters = { ...filters, tag: stringParameter(req, res, "tag") }
        }
        if (req.query["searchName"]) {
            filters = { ...filters, searchName: stringParameter(req, res, "searchName") }
        }
        if (req.query["durationMin"] || req.query["durationMax"]) {
            if (!(req.query["durationMin"] && req.query["durationMax"])) {
                errorResponse(res, "you must specify both durationMin and durationMax");
                return;
            }
            filters = {
                ...filters,
                durationMin: numericalParameter(req, res, "durationMin"),
                durationMax: numericalParameter(req, res, "durationMax")
            }
        }
        if (req.query["duration"]) {
            filters = {
                ...filters,
                duration: numericalParameter(req, res, "duration"),
            }
        }

        res.json(workoutRepository.workouts(filters));
    });

    return {
        app,
        listen: (port: number) => {
            app.listen(port);
        }
    }
}
