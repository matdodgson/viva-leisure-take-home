import { Workout } from "./workout";

export interface WorkoutRepository {
    listTags(): string[];
    workouts(): Workout[];
}

export function workoutRepository(workouts: Workout[]) {
    const repository: WorkoutRepository = {
        listTags: function (): string[] {
            const tags = workouts.map(w => w.tags).flat();
            const tagsNoDupes = [...new Set(tags)];
            return tagsNoDupes;
        },
        workouts: function (): Workout[] {
            return workouts;
        },
    }
    return repository;
}