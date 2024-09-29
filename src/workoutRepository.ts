import { Workout } from "./workout";

export interface WorkoutFilters {
    tag?: string;
    searchName?: string;
    durationMin?: number;
    durationMax?: number;
    duration?: number;
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
            if (filters.durationMin && filters.durationMax) {
                filtered = filtered.filter(w => w.durationMins >= filters.durationMin! && w.durationMins <= filters.durationMax!);
            }
            if (filters.duration) {
                filtered = filtered.filter(w => w.durationMins === filters.duration);
            }
            return filtered;
        },
    }
    return repository;
}