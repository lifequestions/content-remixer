import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function remixContent(content) {
  try {
    console.log('Creating message with API key:', process.env.ANTHROPIC_API_KEY.substring(0, 12) + '...');
    
    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `Create 10 engaging tweets from the following blog post. Each tweet should be under 280 characters and highlight different aspects of the content. Make the tweets engaging and shareable. Include relevant hashtags where appropriate. Format the response as a numbered list with one tweet per line.

Original content: "${content}"`
      }]
    });

    if (!message.content || !message.content[0] || !message.content[0].text) {
      throw new Error('Invalid response from Anthropic API');
    }

    // Get the text content from the response
    const responseText = message.content[0].text;
    
    // Split the response into individual tweets and clean them up
    const tweets = responseText
      .split('\n')
      .filter(line => line.trim().match(/^\d+\./)) // Only keep numbered lines
      .map(tweet => tweet.replace(/^\d+\.\s*/, '').trim()); // Remove numbers and clean whitespace

    if (tweets.length === 0) {
      throw new Error('No tweets were generated');
    }

    return { tweets }; // Return an object with tweets array
  } catch (error) {
    console.error('Anthropic API Error:', error);
    if (error.message.includes('authentication')) {
      throw new Error('API authentication failed. Please check your API key.');
    }
    throw new Error(`Failed to generate tweets: ${error.message}`);
  }
} 