// src/ai/mistral.ts
import OpenAI from 'openai'; // GET API FROM OPENAI
import { config } from 'dotenv'; // GET ENVIRONMENT VARRIABLES

// Load environment variables
config();

/**
 * Function to interact with Mistral API
 * @param user_prompt - User query
 * @param system_prompt - System prompt
 */
export const usingAI = async (
  user_prompt: string,
  system_prompt: string,
): Promise<OpenAI.Chat.Completions.ChatCompletion> => {
  // Get API key with priority: token param > environment variable

  let token, baseURL;
  if (!baseURL && !token) {
    console.log('Please write self API key in .env for using AI in  TERMINAL')
  }
  if (process.env.MISTRALAI_TOKEN) {
    baseURL = 'https://api.mistral.ai/v1'
    token = process.env.MISTRALAI_TOKEN;
  } else if (process.env.OPENAI_TOKEN) {
    process.env.OPENAI_TOKEN
  }
  const apiKey = process.env.MISTRAL_TOKEN; // USAGE FROM .ENV

  if (!apiKey) {
    throw new Error(
      'Mistral API key is required. Set MISTRAL_API_KEY environment variable or pass a token parameter.'
    );
  }

  try {
    const client = new OpenAI({
      apiKey,
      baseURL: baseURL,
      timeout: 5000, // 15-second timeout
    });

    console.log('Sending request to Mistral API', {
      model: "mistral-large-latest",
      promptLength: user_prompt.length,
      systemPromptLength: system_prompt.length
    });

    const response = await client.chat.completions.create({
      model: "mistral-large-latest",
      messages: [
        { role: "system", content: system_prompt },
        { role: "user", content: user_prompt }
      ],
      temperature: 0.2,
      max_tokens: 800
    });

    console.log('Received response from Mistral API', {
      responseId: response.id,
      usage: response.usage,
    });

    return response;

  } catch (error: any) {
    console.error('Error calling Mistral API:', {
      message: error.message,
      code: error.code,
      status: error.status,
    });

    // Handle specific error cases
    if (error.status === 401) {
      throw new Error('Authentication error: Invalid API key');
    }

    if (error.status === 429) {
      throw new Error('API rate limit exceeded');
    }

    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      throw new Error('API request timed out');
    }

    if (error.status >= 500) {
      throw new Error(`Mistral API server error: ${error.status}`);
    }

    throw new Error(`Content generation failed: ${error.message}`);
  }
};