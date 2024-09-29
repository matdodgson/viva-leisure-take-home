import { Workout } from "./workout";

export interface WorkoutRepository {
    listTags(): string[];
}

export function workoutRepository(workouts: Workout[]) {
    const repository: WorkoutRepository = {
        listTags: () => {
            const tags = workouts.map(w => w.tags).flat();
            const tagsNoDupes = [...new Set(tags)];
            return tagsNoDupes;
        }
    }
    return repository;
}