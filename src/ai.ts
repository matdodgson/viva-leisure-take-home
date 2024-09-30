import { OpenAI } from "openai";

const model = "gpt-4o-mini";
const numberOfExercises = 5;

export interface SuggestedWorkout {
  steps: string[];
}

export interface AI {
  suggestedWorkout(heading: string): Promise<SuggestedWorkout>;
}

export function getAI(): AI {
  let openai: OpenAI | undefined = undefined;

  function getOpenAI() {
    if (!openai) {
      openai = new OpenAI();
    }

    return openai;
  }

  return {
    async suggestedWorkout(heading: string): Promise<SuggestedWorkout> {
      const completion = await getOpenAI().chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content:
              "For each exercise, provide 1 sentence only without formatting. Don't number the exercises. Output a line feed after each exercise. Include warm up and cool down exercises. If the heading is not typically associated in a gym context, refuse.",
          },
          {
            role: "user",
            content: `Give me a list of ${numberOfExercises} exercises I can perform in a gym under the heading ${heading}`,
          },
        ],
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        return { steps: [] };
      }

      const exercises = content.split("\n");
      const nonEmptyExercises = exercises.filter((e) => e.length);
      if (nonEmptyExercises.length < numberOfExercises) {
        return { steps: [] };
      }

      return {
        steps: nonEmptyExercises,
      };
    },
  };
}
