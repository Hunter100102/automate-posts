import snoowrap from 'snoowrap';
import { logger } from '../utils/logger.js';

export async function postToReddit(text) {
  const {
    REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET,
    REDDIT_USERNAME,
    REDDIT_PASSWORD,
    REDDIT_SUBREDDIT
  } = process.env;

  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || !REDDIT_USERNAME || !REDDIT_PASSWORD || !REDDIT_SUBREDDIT) {
    throw new Error('Missing one or more Reddit env vars');
  }

  const r = new snoowrap({
    userAgent: 'social-auto-poster/1.0 by ' + REDDIT_USERNAME,
    clientId: REDDIT_CLIENT_ID,
    clientSecret: REDDIT_CLIENT_SECRET,
    username: REDDIT_USERNAME,
    password: REDDIT_PASSWORD
  });

  // For profile post, use 'u_<username>'; otherwise a subreddit
  const subreddit = await r.getSubreddit(REDDIT_SUBREDDIT);
  const result = await subreddit.submitSelfpost({
    title: text.split('\n')[0].slice(0, 280) || 'Update',
    text
  });

  logger.info('Reddit post url: ' + result?.url);
  return { url: result?.url };
}
