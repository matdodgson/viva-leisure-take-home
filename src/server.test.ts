import { Workout } from "./workout";
import { workoutRepository } from "./workoutRepository";
import { server } from "./server";
import request from "supertest";
import { randomUUID } from "node:crypto";

const workout: Workout = {
    id: "acd7e6a4-03bc-499c-b85b-a3efe7625fad",
    name: "some-name",
    durationMins: 15,
    steps: ["Step1", "Step2", "Step3"],
    tags: ["tag1", "tag2"]
}

describe("list-tags", () => {
    describe("when configured with tags", () => {
        it("returns deduped tags", async () => {
            const workouts: Workout[] = [
                { ...workout, tags: ["tag1"] },
                { ...workout, tags: ["tag1"] },
            ]
            const repository = workoutRepository(workouts);
            const server1 = server(repository);
            const response = await request(server1.app)
                .get("/api/list-tags")
                .set("Accept", "application/json");
            expect(response.headers["content-type"]).toMatch(/json/);
            expect(response.status).toEqual(200);
            expect(response.body).toEqual(["tag1"]);
        });
    });
});

describe("workouts", () => {
    describe("when no filters are specified", () => {
        it("returns all workouts", async () => {
            const workouts: Workout[] = [
                { ...workout, id: randomUUID() },
                { ...workout, id: randomUUID() },
            ]
            const repository = workoutRepository(workouts);
            const server1 = server(repository);
            const response = await request(server1.app)
                .get("/api/workouts")
                .set("Accept", "application/json");
            expect(response.headers["content-type"]).toMatch(/json/);
            expect(response.status).toEqual(200);
            expect(response.body).toEqual(workouts);
        });
    });

    describe("when tag filters are specified", () => {
        it("filters on the last tag specified", async () => {
            const workout1 = { ...workout, tags: ["tag1"] };
            const workout2 = { ...workout, tags: ["tag2"] };
            const workouts: Workout[] = [
                workout1,
                workout2
            ]
            const repository = workoutRepository(workouts);
            const server1 = server(repository);
            const response = await request(server1.app)
                .get("/api/workouts?tag=tag1&tag=tag2")
                .set("Accept", "application/json");
            expect(response.headers["content-type"]).toMatch(/json/);
            expect(response.status).toEqual(200);
            expect(response.body).toEqual([workout2]);
        });
    });

    describe("when a tag filter that results in a parsed object is specified", () => {
        it("returns a 400", async () => {
            const workouts: Workout[] = [
                workout,
            ]
            const repository = workoutRepository(workouts);
            const server1 = server(repository);
            const response = await request(server1.app)
                .get("/api/workouts?tag[a]=tag1")
                .set("Accept", "application/json");
            expect(response.headers["content-type"]).toMatch(/json/);
            expect(response.status).toEqual(400);
        });
    });

    describe("when a searchName filter is specified", () => {
        it("filters correctly", async () => {
            const workout1 = { ...workout, name: "thename1" };
            const workout2 = { ...workout, name: "thename2" };
            const workouts: Workout[] = [
                workout1,
                workout2
            ]
            const repository = workoutRepository(workouts);
            const server1 = server(repository);
            const response = await request(server1.app)
                .get("/api/workouts?searchName=name1")
                .set("Accept", "application/json");
            expect(response.headers["content-type"]).toMatch(/json/);
            expect(response.status).toEqual(200);
            expect(response.body).toEqual([workout1]);
        });
    });

    describe.each([
        [10, undefined],
        [undefined, 10],
    ])("when given an invalid combination of durationMin and durationMax", (durationMin?: number, durationMax?: number) => {
        it("returns a 400", async () => {
            const repository = workoutRepository([]);
            const server1 = server(repository);
            const query = Object.entries({ durationMin, durationMax })
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .filter(([k, v]) => v)
                .map(([k, v]) => `${k}=${v}`)
                .join("&");
            const response = await request(server1.app)
                .get(`/api/workouts?${query}`)
                .set("Accept", "application/json");
            expect(response.headers["content-type"]).toMatch(/json/);
            expect(response.status).toEqual(400);
        });
    });

    describe.each([
        [10, "abc"],
        ["abc", 10],
    ])("when given an invalid durationMin or durationMax", (durationMin: number | string, durationMax: number | string) => {
        it("returns a 400", async () => {
            const repository = workoutRepository([]);
            const server1 = server(repository);
            const query = Object.entries({ durationMin, durationMax })
                .map(([k, v]) => `${k}=${v}`)
                .join("&");
            const response = await request(server1.app)
                .get(`/api/workouts?${query}`)
                .set("Accept", "application/json");
            expect(response.headers["content-type"]).toMatch(/json/);
            expect(response.status).toEqual(400);
        });
    });

    describe("when given a durationMin and durationMax", () => {
        it("filters correctly", async () => {
            const workout1: Workout = { ...workout, durationMins: 10 };
            const workout2: Workout = { ...workout, durationMins: 20 };
            const repository = workoutRepository([workout1, workout2]);
            const server1 = server(repository);
            const response = await request(server1.app)
                .get(`/api/workouts?durationMin=10&durationMax=11`)
                .set("Accept", "application/json");
            expect(response.headers["content-type"]).toMatch(/json/);
            expect(response.status).toEqual(200);
            expect(response.body).toEqual([workout1]);
        });
    });

    describe("when given an invalid duration", () => {
        it("returns a 400", async () => {
            const repository = workoutRepository([]);
            const server1 = server(repository);
            const response = await request(server1.app)
                .get(`/api/workouts?duration=abc`)
                .set("Accept", "application/json");
            expect(response.headers["content-type"]).toMatch(/json/);
            expect(response.status).toEqual(400);
        });
    });

    describe("when given a duration", () => {
        it("filters correctly", async () => {
            const workout1: Workout = { ...workout, durationMins: 20 };
            const workout2: Workout = { ...workout, durationMins: 30 };
            const repository = workoutRepository([workout1, workout2]);
            const server1 = server(repository);
            const response = await request(server1.app)
                .get(`/api/workouts?duration=20`)
                .set("Accept", "application/json");
            expect(response.headers["content-type"]).toMatch(/json/);
            expect(response.status).toEqual(200);
            expect(response.body).toEqual([workout1]);
        });
    });
});
