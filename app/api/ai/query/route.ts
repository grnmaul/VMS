import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query text is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured on server' },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // build a prompt that guides the model to act as a Madiun city assistant
    const prompt = `You are an intelligent assistant for Kota Madiun in Indonesia. Provide helpful
and relevant information about locations, routes, public facilities, and general city advice
in Bahasa Indonesia. User query: "${query}"`;

    const response = await client.responses.create({
      model: 'gpt-4o-mini',
      input: prompt,
      max_output_tokens: 500,
    });

    // the OpenAI "responses" API returns a nested structure
    const text = Array.isArray(response.output) && response.output[0]?.content
      ? response.output[0].content.map(item => item.text).join('')
      : '';

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('AI query error', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
