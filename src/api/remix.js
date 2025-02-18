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
        content: 'Create exactly 10 tweets from this text. Do not use any hashtags, emojis, or special characters. Write in plain conversational English using only periods and commas for punctuation. Each tweet must be under 280 characters. Format as a numbered list like this: 1. First tweet 2. Second tweet etc.\n\nHere is the text to convert: "' + content + '"'
      }]
    });

    console.log('Raw response from Claude:', message.content[0].text);

    if (!message.content || !message.content[0] || !message.content[0].text) {
      throw new Error('Invalid response from Anthropic API');
    }

    const responseText = message.content[0].text;
    console.log('Response text before processing:', responseText);
    
    // Split and clean the tweets
    let tweets = responseText.split('\n');
    console.log('After split:', tweets);

    tweets = tweets.filter(line => line.trim().match(/^\d+\./));
    console.log('After number filter:', tweets);

    tweets = tweets.map(tweet => {
      const step1 = tweet.replace(/^\d+\.\s*/, '');
      console.log('After number removal:', step1);
      
      const step2 = step1.replace(/\s*#\w+/g, '');
      console.log('After hashtag word removal:', step2);
      
      const step3 = step2.replace(/#/g, '');
      console.log('After # symbol removal:', step3);
      
      const step4 = step3.replace(/[^\w\s.,!?]/g, '');
      console.log('After special char removal:', step4);
      
      const step5 = step4.replace(/\s+/g, ' ').trim();
      console.log('After space cleanup:', step5);
      
      return step5;
    });

    if (tweets.length === 0) {
      throw new Error('No tweets were generated');
    }

    // Final verification
    const problematicTweets = tweets.filter(tweet => 
      tweet.includes('#') || /[^\w\s.,!?]/.test(tweet)
    );
    
    if (problematicTweets.length > 0) {
      console.error('Found problematic tweets:', problematicTweets);
      throw new Error('Tweets still contain hashtags or special characters after cleaning');
    }

    console.log('Final cleaned tweets:', tweets);
    return { tweets };
  } catch (error) {
    console.error('Anthropic API Error:', error);
    if (error.message.includes('authentication')) {
      throw new Error('API authentication failed. Please check your API key.');
    }
    throw new Error(`Failed to generate tweets: ${error.message}`);
  }
} 