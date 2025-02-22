import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a financial news analyst. Generate a brief market analysis with sector-specific impacts.",
        },
        {
          role: "user",
          content: "Generate a current market analysis with impacts for tech, finance, and retail sectors.",
        },
      ],
    });

    // Process the response and format it as a news article
    const response = completion.choices[0].message.content;



    return NextResponse.json({ success: true, data: response });
    return NextResponse.json(
      { success: false, error: "Failed to generate news" },
      { status: 500 }
    );
  }
}