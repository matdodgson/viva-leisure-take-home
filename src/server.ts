import express from "express";
import { WorkoutRepository } from "./workoutRepository";

export function server(workoutRepository: WorkoutRepository) {
    const app = express();

    app.get("/api/list-tags", function (req, res) {
        res.json(workoutRepository.listTags());
    });

    app.get("/api/workouts", function (req, res) {
        res.json(workoutRepository.workouts());
    });

    return {
        app,
        listen: (port: number) => {
            app.listen(port);
        }
    }
}
