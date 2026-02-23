import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';

export async function postToFacebook(message) {
  const pageId = process.env.FB_PAGE_ID;
  const token  = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) throw new Error('Missing FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN');

  const url = `https://graph.facebook.com/${pageId}/feed`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, access_token: token })
  });
  const data = await res.json();
  if (!res.ok) {
    logger.error(`Facebook error: ${JSON.stringify(data)}`);
    throw new Error(`Facebook API ${res.status}`);
  }
  logger.info(`Facebook post id: ${data.id}`);
  return data;
}
