import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';

// Posts a simple text share via UGC
export async function postToLinkedIn(text) {
  const token = process.env.LI_ACCESS_TOKEN;
  const memberUrn = process.env.LI_MEMBER_URN;
  const orgUrn = process.env.LI_ORG_URN;

  if (!token) throw new Error('Missing LI_ACCESS_TOKEN');
  const author = orgUrn?.startsWith('urn:li:organization:') ? orgUrn :
                 memberUrn?.startsWith('urn:li:person:') ? memberUrn : null;
  if (!author) throw new Error('Provide LI_MEMBER_URN or LI_ORG_URN');

  const body = {
    author,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory: 'NONE'
      }
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
  };

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) {
    logger.error(`LinkedIn error: ${JSON.stringify(data)}`);
    throw new Error(`LinkedIn API ${res.status}`);
  }
  logger.info(`LinkedIn post URN: ${data.id || '(no id in response)'}`);
  return data;
}
