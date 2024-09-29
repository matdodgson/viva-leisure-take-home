import { Workout } from "./workout";

export interface WorkoutFilters {
    tag?: string;
    searchName?: string;
}

export interface WorkoutRepository {
    listTags(): string[];
    workouts(filters: WorkoutFilters): Workout[];
}

export function workoutRepository(workouts: Workout[]) {
    const repository: WorkoutRepository = {
        listTags: function (): string[] {
            const tags = workouts.map(w => w.tags).flat();
            const tagsNoDupes = [...new Set(tags)];
            return tagsNoDupes;
        },
        workouts: function (filters: WorkoutFilters): Workout[] {
            let filtered = workouts;
            if (filters.tag) {
                filtered = filtered.filter(w => w.tags.includes(filters.tag!));
            }
            if (filters.searchName) {
                filtered = filtered.filter(w => w.name.includes(filters.searchName!));
            }
            return filtered;
        },
    }
    return repository;
}