import express from "express";
import { WorkoutRepository } from "./workoutRepository";

export function server(workoutRepository: WorkoutRepository) {
    const app = express();

    app.get("/api/list-tags", function (req, res) {
        const tags = workoutRepository.listTags();
        res.json(tags);
    });

    return {
        app,
        listen: (port: number) => {
            app.listen(port);
        }
    }
}
