import { readFileSync } from "fs";
import { server } from "./server";
import { workoutRepository } from "./workoutRepository";
import { join } from "node:path";
import { Workout } from "./workout";

const srcPath = import.meta.dirname;
const workoutsPath = join(srcPath, "..", "data", "workouts.json");
const workouts = JSON.parse(readFileSync(workoutsPath).toString()) as Workout[];
const repository = workoutRepository(workouts);
const server1 = server(repository);
server1.listen(3000);
