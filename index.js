import 'dotenv/config';
import { generatePost } from './src/generator.js';
import { postToFacebook } from './src/posters/facebook.js';
import { postToLinkedIn } from './src/posters/linkedin.js';
import { postToReddit } from './src/posters/reddit.js';
import { logger } from './src/utils/logger.js';

async function main() {
  try {
    const enabled = (process.env.ENABLED_PLATFORMS || 'facebook,linkedin,reddit')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    logger.info(`Enabled platforms: ${enabled.join(', ')}`);

    const content = await generatePost({
      prompt: process.env.CONTENT_PROMPT || 'Write a helpful automation tip for small businesses.',
      brand: process.env.BRAND_NAME || 'Your Brand',
      minWords: parseInt(process.env.MIN_WORDS || '60', 10),
      maxWords: parseInt(process.env.MAX_WORDS || '180', 10),
      addHashtags: (process.env.ADD_HASHTAGS || 'true').toLowerCase() === 'true',
      hashtags: (process.env.HASHTAGS || '').split(',').map(s => s.trim()).filter(Boolean),
    });

    logger.info(`Generated content (preview):\n${content}\n`);

    if (enabled.includes('facebook')) {
      try {
        await postToFacebook(content);
        logger.info('Facebook: posted successfully');
      } catch (e) {
        logger.error(`Facebook post failed: ${e?.message}`);
      }
    }

    if (enabled.includes('linkedin')) {
      try {
        await postToLinkedIn(content);
        logger.info('LinkedIn: posted successfully');
      } catch (e) {
        logger.error(`LinkedIn post failed: ${e?.message}`);
      }
    }

    if (enabled.includes('reddit')) {
      try {
        await postToReddit(content);
        logger.info('Reddit: posted successfully');
      } catch (e) {
        logger.error(`Reddit post failed: ${e?.message}`);
      }
    }

    logger.info('Run completed.');
    process.exit(0);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

main();
