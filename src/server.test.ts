import { Workout } from "./workout";
import { workoutRepository } from "./workoutRepository";
import { getServer as serverGetServer } from "./server";
import supertestRequest from "supertest";
import { randomUUID } from "node:crypto";
import { App } from "supertest/types";
import { getAI } from "./ai";

const workout: Workout = {
  id: "acd7e6a4-03bc-499c-b85b-a3efe7625fad",
  name: "some-name",
  durationMins: 15,
  steps: ["Step1", "Step2", "Step3"],
  tags: ["tag1", "tag2"],
};

function getServer(workouts: Workout[]) {
  const repository = workoutRepository(workouts);
  return serverGetServer(repository, getAI());
}

function getRequest(app: App, url: string, expectedStatusCode: number = 200) {
  return supertestRequest(app)
    .get(url)
    .set("Accept", "application/json")
    .expect("Content-Type", /json/)
    .expect(expectedStatusCode);
}

describe("list-tags", () => {
  describe("when configured with tags", () => {
    it("returns deduped tags", async () => {
      const workouts: Workout[] = [
        { ...workout, tags: ["tag1"] },
        { ...workout, tags: ["tag1"] },
      ];
      const server = getServer(workouts);
      const response = await getRequest(server.app, "/api/list-tags", 200);
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
      ];
      const server = getServer(workouts);
      const response = await getRequest(server.app, "/api/workouts", 200);
      expect(response.body).toEqual(workouts);
    });
  });

  describe("when tag filters are specified", () => {
    it("filters on the last tag specified", async () => {
      const workout1 = { ...workout, tags: ["tag1"] };
      const workout2 = { ...workout, tags: ["tag2"] };
      const workouts: Workout[] = [workout1, workout2];
      const server = getServer(workouts);
      const response = await getRequest(
        server.app,
        "/api/workouts?tag=tag1&tag=tag2",
        200,
      );
      expect(response.body).toEqual([workout2]);
    });
  });

  describe("when a tag filter that results in a parsed object is specified", () => {
    it("returns a 400", async () => {
      const workouts: Workout[] = [workout];
      const server = getServer(workouts);
      await getRequest(server.app, "/api/workouts?tag[a]=tag1", 400);
    });
  });

  describe("when a searchName filter is specified", () => {
    it("filters correctly", async () => {
      const workout1 = { ...workout, name: "thename1" };
      const workout2 = { ...workout, name: "thename2" };
      const workouts: Workout[] = [workout1, workout2];
      const server = getServer(workouts);
      const response = await getRequest(
        server.app,
        "/api/workouts?searchName=name1",
        200,
      );
      expect(response.body).toEqual([workout1]);
    });
  });

  describe.each([
    [10, undefined],
    [undefined, 10],
  ])(
    "when given an invalid combination of durationMin and durationMax",
    (durationMin?: number, durationMax?: number) => {
      it("returns a 400", async () => {
        const server = getServer([]);
        const query = Object.entries({ durationMin, durationMax })
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .filter(([k, v]) => v)
          .map(([k, v]) => `${k}=${v}`)
          .join("&");
        await getRequest(server.app, `/api/workouts?${query}`, 400);
      });
    },
  );

  describe.each([
    [10, "abc"],
    ["abc", 10],
  ])(
    "when given an invalid durationMin or durationMax",
    (durationMin: number | string, durationMax: number | string) => {
      it("returns a 400", async () => {
        const server = getServer([]);
        const query = Object.entries({ durationMin, durationMax })
          .map(([k, v]) => `${k}=${v}`)
          .join("&");
        await getRequest(server.app, `/api/workouts?${query}`, 400);
      });
    },
  );

  describe("when given a durationMin and durationMax", () => {
    it("filters correctly", async () => {
      const workout1: Workout = { ...workout, durationMins: 10 };
      const workout2: Workout = { ...workout, durationMins: 20 };
      const server = getServer([workout1, workout2]);
      const response = await getRequest(
        server.app,
        `/api/workouts?durationMin=10&durationMax=11`,
        200,
      );
      expect(response.body).toEqual([workout1]);
    });
  });

  describe("when given an invalid duration", () => {
    it("returns a 400", async () => {
      const server = getServer([]);
      await getRequest(server.app, `/api/workouts?duration=abc`, 400);
    });
  });

  describe("when given a duration", () => {
    it("filters correctly", async () => {
      const workout1: Workout = { ...workout, durationMins: 20 };
      const workout2: Workout = { ...workout, durationMins: 30 };
      const server = getServer([workout1, workout2]);
      const response = await getRequest(
        server.app,
        `/api/workouts?duration=20`,
        200,
      );
      expect(response.body).toEqual([workout1]);
    });
  });

  describe("when given a non-existent workout id", () => {
    it("returns a 404", async () => {
      const workout1: Workout = { ...workout, id: "jhwerc78y23489c7y" };
      const server = getServer([workout1]);
      await getRequest(server.app, `/api/workout/uh345c98y2345c90u`, 404);
    });
  });

  describe("when given a workout id", () => {
    it("filters correctly", async () => {
      const workout1: Workout = { ...workout, id: "jhwerc78y23489c7y" };
      const workout2: Workout = { ...workout, id: "uh345c98y2345c90u" };
      const server = getServer([workout1, workout2]);
      const response = await getRequest(
        server.app,
        `/api/workout/uh345c98y2345c90u`,
        200,
      );
      expect(response.body).toEqual(workout2);
    });
  });
});

// describe("suggested workout", () => {
//   describe("when given a valid heading", () => {
//     it("returns a list of 5 or more exercises", async () => {
//       const server = getServer([]);
//       const response = await getRequest(
//         server.app,
//         "/api/ai/suggested-workout?heading=Endurance+Challenge",
//         200,
//       );
//       const body = response.body as SuggestedWorkout;
//       expect(Array.isArray(body.steps)).toBe(true);
//       expect(body.steps.length).toBeGreaterThanOrEqual(5);
//     });
//   });

//   describe("when given an inappropriate heading", () => {
//     it("returns an empty list", async () => {
//       const server = getServer([]);
//       const response = await getRequest(
//         server.app,
//         "/api/ai/suggested-workout?heading=Penis+Challenge",
//         200,
//       );
//       const body = response.body as SuggestedWorkout;
//       expect(Array.isArray(body.steps)).toBe(true);
//       expect(body.steps).toHaveLength(0);
//     });
//   });
// });
