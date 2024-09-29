import express from "express";
import { WorkoutFilters, WorkoutRepository } from "./workoutRepository";
import qs from "qs";

function errorResponse(res: express.Response, error: string, statusCode: number = 400) {
    res.status(statusCode).json({ error });
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
            if (typeof req.query["tag"] !== "string") {
                errorResponse(res, "bad tag");
                res.end();
            }

            filters = { ...filters, tag: req.query["tag"] as string }
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
