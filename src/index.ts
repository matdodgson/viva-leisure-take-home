import { readFileSync } from "fs";
import { getServer } from "./server";
import { workoutRepository } from "./workoutRepository";
import { join } from "node:path";
import { Workout } from "./workout";
import { getAI } from "./ai";

const srcPath = import.meta.dirname;
const workoutsPath = join(srcPath, "..", "data", "workouts.json");
const workouts = JSON.parse(readFileSync(workoutsPath).toString()) as Workout[];
const repository = workoutRepository(workouts);
const ai = getAI();
const server = getServer(repository, ai);
server.listen(3000);
