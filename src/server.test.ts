import { Workout } from "./workout";
import { workoutRepository } from "./workoutRepository";
import { server } from "./server";
import request from "supertest";

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
                .set("Accept", "application/json")
            expect(response.headers["content-type"]).toMatch(/json/);
            expect(response.status).toEqual(200);
            expect(response.body).toEqual(["tag1"]);
        });
    });
});
