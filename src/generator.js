import OpenAI from 'openai';
import { logger } from './utils/logger.js';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function clampText(text, minWords, maxWords) {
  const words = text.split(/\s+/);
  if (words.length < minWords) return text; // let it ride
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '…';
}

export async function generatePost({ prompt, brand, minWords, maxWords, addHashtags, hashtags }) {
  const system = `You are a marketing copywriter for ${brand}. 
Write concise, high-signal social posts that are helpful and non-salesy, with a clear call-to-action. 
Avoid fluff. Use short sentences and plain language.`;

  const user = [
    `Topic / prompt: ${prompt}`,
    `Audience: Small business owners and operators`,
    `Tone: friendly, practical, confident`,
    `Max paragraphs: 2`,
    `Include a subtle CTA to visit the website or DM for help.`
  ].join('\n');

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    temperature: 0.7
  });

  let text = completion.choices?.[0]?.message?.content?.trim() || '';
  text = clampText(text, minWords, maxWords);

  if (addHashtags) {
    const preferred = (hashtags || []).map(t => t.replace(/[#\s]/g, '')).filter(Boolean);
    const uniq = new Set(preferred);
    // append 2–3 lightweight generic tags
    ['automation', 'smallbusiness', 'productivity'].forEach(t => uniq.add(t));
    const tagLine = Array.from(uniq).slice(0, 6).map(t => `#${t}`).join(' ');
    text = text + '\n\n' + tagLine;
  }

  logger.info('Generated post content.');
  return text;
}
