import { GoogleGenerativeAI } from '@google/generative-ai';
import { envConfig } from '../env-config/config';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(envConfig.geminiApiKey!);

// Get AI response from Gemini
const getAIResponse = async (
  userMessage: string,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> => {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({ 
      model: envConfig.geminiModel! 
    });

    // Build conversation context
    let prompt = '';

    // Add system instruction
    prompt += 'You are a helpful AI assistant. Be concise, friendly, and informative.\n\n';

    // Add conversation history for context
    if (conversationHistory && conversationHistory.length > 0) {
      prompt += 'Previous conversation:\n';
      conversationHistory.forEach((msg) => {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        prompt += `${role}: ${msg.content}\n`;
      });
      prompt += '\n';
    }

    // Add current user message
    prompt += `User: ${userMessage}\nAssistant:`;

    // Generate response
    const result = await model.generateContent(prompt);
    const response = result.response;
    const aiResponse = response.text();

    return aiResponse || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error getting AI response from Gemini:', error);
    throw new Error('Failed to get AI response');
  }
};

// Stream AI response (for typing effect)
const streamAIResponse = async (
  userMessage: string,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: envConfig.geminiModel!
    });

    // Build prompt (same as above)
    let prompt = 'You are a helpful AI assistant. Be concise, friendly, and informative.\n\n';

    if (conversationHistory && conversationHistory.length > 0) {
      prompt += 'Previous conversation:\n';
      conversationHistory.forEach((msg) => {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        prompt += `${role}: ${msg.content}\n`;
      });
      prompt += '\n';
    }

    prompt += `User: ${userMessage}\nAssistant:`;

    // Stream response
    const result = await model.generateContentStream(prompt);

    let fullResponse = '';

    // Process stream chunks
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      
      if (onChunk) {
        onChunk(chunkText);
      }
    }

    return fullResponse;
  } catch (error) {
    console.error('Error streaming AI response from Gemini:', error);
    throw new Error('Failed to stream AI response');
  }
};

export { 
  getAIResponse, 
  streamAIResponse 
};