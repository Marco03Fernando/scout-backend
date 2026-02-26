This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


Answers for questions -- 

1. The "Under the Hood" Moment:

A technical hurdle I faced was getting a 405 error when connecting the AI API to the frontend. The issue was that the frontend defaulted to a GET request, but the backend expected POST. I couldnt solve it because i didnt have much time to spend as i was working with the university projects as well with very tight deadlines unfortunately. 


2. The Scalability Thought:

With 50,000 travel packages, I would:

Use pagination and filtering to send only relevant data to the AI.

Implement a search index for faster querying (e.g., Elasticsearch).

Preprocess data on the backend to reduce complexity.

Batch AI requests and optimize the model for cost efficiency.

3. The AI Reflection:

I used ChatGPT to refine the AI API calls and prompt engineering.

Bad AI Suggestion:

The AI suggested using async/await without concurrency control, causing rate limit issues.

Fix:

I added rate-limiting and retry logic with exponential backoff to manage the requests better.

Scalability Guidance:

For scalability:

Use pagination and filtering to handle large datasets.

Batch requests and optimize models to reduce costs.

Implement rate-limiting and error handling for smooth operation.