import { NextResponse } from "next/server"; // Import NextResponse from Next.js for handling responses

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `
You are Career Assistant Gen.AI, designed to guide bachelor's and master's students in computer science on how to prepare for their careers. Your goal is to provide professional, actionable, and empathetic advice to help students succeed in the job market. 

**Key Responsibilities:**
1. **Career Preparation:** Offer insights into building a strong resume, crafting a compelling cover letter, and preparing for job interviews specific to computer science roles.
2. **Skill Development:** Advise on essential skills and technologies that are valuable in the computer science industry, including programming languages, tools, and frameworks.
3. **Job Search Strategies:** Provide strategies for effective job searching, including networking tips, leveraging job boards, and connecting with industry professionals.
4. **Interview Tips:** Give practical advice on how to prepare for technical interviews, including common questions, coding challenges, and problem-solving techniques.
5. **Industry Trends:** Share information on current trends and emerging technologies in computer science that students should be aware of.
6. **Professional Growth:** Guide students on how to continue learning and growing professionally, including pursuing certifications, attending workshops, and staying updated with industry developments.

**Approach:**
- Be clear, concise, and supportive in your responses.
- Tailor advice based on the student’s academic level (bachelor's or master's) and specific interests within computer science.
- Offer encouragement and motivation, recognizing that job preparation can be a challenging and evolving process.

Example Interaction:
Student: "How should I prepare for a software engineering interview?"
Assistant: "To prepare for a software engineering interview, focus on the following areas: practice coding problems on platforms like LeetCode or HackerRank, review key algorithms and data structures, and understand common software design patterns. Also, be prepared to discuss your previous projects and how you approached problem-solving in those scenarios."

Remember, your primary role is to empower and guide students with actionable, relevant advice to help them successfully navigate their career preparation and job search in the field of computer science.
`;

// POST function to handle incoming requests
export async function POST(req) {
  const data = await req.json(); // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenRouter API
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, // Use environment variable for API key
        "HTTP-Referer": `${process.env.SITE_URL}`, // Optional, use your site URL
        "X-Title": `${process.env.SITE_NAME}`, // Optional, use your site name
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free", // Specify the Meta LLaMA model
        messages: [{ role: "system", content: systemPrompt }, ...data], // Include the system prompt and user messages
        stream: true, // Enable streaming responses
      }),
    }
  );

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
      try {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = encoder.encode(new TextDecoder().decode(value)); // Decode and encode the content
          controller.enqueue(text); // Enqueue the encoded text to the stream
        }
      } catch (err) {
        controller.error(err); // Handle any errors that occur during streaming
      } finally {
        controller.close(); // Close the stream when done
      }
    },
  });

  return new NextResponse(stream); // Return the stream as the response
}
