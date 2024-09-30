# Viva Leisure Take Home

Submission by Mat Dodgson

## Optional end point

The end point is to generate a suggested workout from the OpenAI API based on the provided heading. For this to work you'll need to add the OPENAI_API_KEY environment variable before running.

It's available at the url "/api/ai/suggested-workout". The required querystring parameter is "heading".

The json response is of the form:

```typescript
export interface SuggestedWorkout {
  steps: string[];
}
```

Note that the response from the OpenAI API is not always what's expected. One thing I've noticed is that sometimes it will return a valid response when using an inappropriate heading. Some prompt engineering or using a different model may help this.
