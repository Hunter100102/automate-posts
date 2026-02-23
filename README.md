# Social Auto Poster (OpenAI → Facebook Pages, LinkedIn, Reddit)

This repo lets you **generate a post with OpenAI from a prompt** and **auto-post it** to **Facebook Pages**, **LinkedIn**, and **Reddit** on a schedule (e.g., **every other day**). Deploy as a **Render Cron Job** or with **Heroku Scheduler**.

---

## What you get

- `index.js` — orchestrates one run: generates content → posts to each platform you've enabled.
- `src/generator.js` — uses OpenAI to turn your prompt + style into a platform-tailored post (with optional hashtags).
- `src/posters/facebook.js` — publish to a **Facebook Page** via Graph API.
- `src/posters/linkedin.js` — publish to **LinkedIn** (member or organization page) via LinkedIn API.
- `src/posters/reddit.js` — publish to **Reddit** via `snoowrap`.
- `src/utils/logger.js` — rotating file logger.
- `.env.example` — all required secrets and toggles.
- `render.yaml` — example **Render Cron Job** definition.
- `Procfile` — example **Heroku Scheduler** command.
- `package.json` + `pnpm-lock.yaml` (works with `npm`, `yarn`, or `pnpm`).

> The job **runs once** and exits. Your scheduler (Render/Heroku) controls **when** it runs (e.g., every 2 days).

---

## Quick Start

### 1) Clone & install

```bash
git clone <your_repo_url> social-auto-poster
cd social-auto-poster
npm install
# or: pnpm install / yarn
```

### 2) Fill in environment variables

Copy the example env and edit:
```bash
cp .env.example .env
```

Open `.env`, then set at minimum:

- **General**
  - `OPENAI_API_KEY` — from https://platform.openai.com/api-keys
  - `CONTENT_PROMPT` — your base prompt (topic, voice, audience). Example included.
  - `ENABLED_PLATFORMS=facebook,linkedin,reddit` — comma list; remove any you’re not using.
  - `BRAND_NAME` — e.g., `AutomateIT`
  - `HASHTAGS` — optional comma list of preferred tags (we’ll mix with model suggestions).

- **Facebook (Page)** — we post to a Page you manage (not personal profile):
  - `FB_PAGE_ID` — get it from your Page’s About > Page ID.
  - `FB_PAGE_ACCESS_TOKEN` — a **Page Access Token** with `pages_manage_posts`.
    - Create an app at https://developers.facebook.com/ → Products: Facebook Login (for your own account) or get a **long-lived user token**, then exchange for a **Page token**. See the notes below.

- **LinkedIn**
  - `LI_ACCESS_TOKEN` — a user token with `w_member_social` (and `w_organization_social` if posting as an organization).
  - Choose one identifier
    - Post as **member** → set `LI_MEMBER_URN=urn:li:person:<your_id>`
    - Post as **organization** → set `LI_ORG_URN=urn:li:organization:<your_org_id>`
  - Leave the unused one blank.

- **Reddit** (uses password flow via `snoowrap`):
  - `REDDIT_CLIENT_ID` — from https://www.reddit.com/prefs/apps
  - `REDDIT_CLIENT_SECRET`
  - `REDDIT_USERNAME`
  - `REDDIT_PASSWORD`
  - `REDDIT_SUBREDDIT` — where to post (e.g., `u_yourprofile` for user profile or a subreddit you can post to).

> ⚠️ **Never commit `.env`**. Keep secrets out of Git via `.gitignore`.

### 3) Test locally (one-off run)

```bash
node index.js
```

If everything’s configured, you’ll see logs for generation and each platform’s response.

### 4) Deploy & schedule

#### Option A — Render (recommended)
- Create a **Cron Job** (Render Dashboard → New → Cron Job):
  - **Environment**: Node
  - **Build Command**: `npm install`
  - **Start Command**: `node index.js`
  - **Schedule**: `every 2 days` (or use a custom CRON like `0 14 */2 * *` for every other day at 14:00 UTC).
  - **Environment**: copy your `.env` values into the Render dashboard.
- Alternatively, use the included `render.yaml` for Infrastructure as Code.

#### Option B — Heroku
- Push to Heroku (web dyno not required if using Scheduler).
- Add **Heroku Scheduler** add-on: schedule `node index.js` to run **every 2 days**.

---

## How to get the platform tokens

### Facebook Page Access Token
1. Create a Facebook app at https://developers.facebook.com/ (type: “Consumer” is fine).
2. Add **Facebook Login** and **Pages API** products to your app.
3. Under **Tools → Graph API Explorer**, get a **User Access Token** with scopes: `pages_read_engagement`, `pages_manage_posts`.
4. In Graph API Explorer, call `GET /me/accounts` using that user token → copy your **Page Access Token** for the target page.
5. (Recommended) Exchange the user token to a **long-lived** token, then fetch the page token again so it lasts ~60 days.
6. Set `FB_PAGE_ID` and `FB_PAGE_ACCESS_TOKEN` in `.env`.

> Docs: https://developers.facebook.com/docs/graph-api

### LinkedIn Access Token
- Easiest path for a single account: use your own OAuth 2 token from your dev app (scopes `w_member_social`, optionally `w_organization_social`).
- Get your member URN (see `GET https://api.linkedin.com/v2/me`) or org URN.
- Put the token + URN into `.env`.

> Docs: https://learn.microsoft.com/linkedin/marketing/integrations/community-management/shares/ugc-post-api

### Reddit Credentials
1. Go to https://www.reddit.com/prefs/apps → “create another app”:
   - Type: “script”
   - Redirect URI: `http://localhost:8080` (not actually used for password flow)
2. Save **client id/secret**, plus your **Reddit username/password**.
3. Choose `REDDIT_SUBREDDIT` (a subreddit you can post to). To post on your profile, use `u_<username>`.

> Package: https://github.com/not-an-aardvark/snoowrap

---

## Environment Variables

See `.env.example` for the full list. Here are the essentials with sample values:

```
OPENAI_API_KEY=sk-...
CONTENT_PROMPT="You are the AutomateIT marketing voice. Create a helpful, upbeat post for small business owners about automation, CRMs, and saving time. Keep it 1-2 short paragraphs with a clear CTA."
BRAND_NAME=AutomateIT
HASHTAGS=automation,smallbusiness,crm,atllanta,webdev

ENABLED_PLATFORMS=facebook,linkedin,reddit

# Facebook
FB_PAGE_ID=123456789012345
FB_PAGE_ACCESS_TOKEN=EAAG...

# LinkedIn
LI_ACCESS_TOKEN=eyJhbGciOi...
LI_MEMBER_URN=urn:li:person:XXXXXXXX
LI_ORG_URN=

# Reddit
REDDIT_CLIENT_ID=xxxxxxxx
REDDIT_CLIENT_SECRET=xxxxxxxx
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
REDDIT_SUBREDDIT=u_your_reddit_username

# (optional) content knobs
MIN_WORDS=60
MAX_WORDS=180
ADD_HASHTAGS=true
```

---

## Customizing the voice/tone

- Adjust `CONTENT_PROMPT` for your brand voice.
- Set `HASHTAGS` as a comma list. Model will blend these with its own suggestions and dedupe.
- Tune `MIN_WORDS` / `MAX_WORDS` per platform (defaults are applied globally).

---

## Notes & Limits

- **Images**: The starter posts **text-only** for reliability. You can extend posters to upload images (FB `/photos`, LinkedIn assets, Reddit `submitSelfpost` with media).  
- **Rate limits**: Each API has quotas—avoid running too often.
- **Compliance**: Follow site rules and policies (especially for Reddit + subreddits).

---

## Troubleshooting

- **LinkedIn 401/403**: scopes missing (`w_member_social`); token expired.
- **Facebook 190/OAuthException**: token expired or wrong token type (need Page token, not user).
- **Reddit 403**: subreddit rules, account age/karma limits, or API scope issues.
- **Nothing posts**: check `ENABLED_PLATFORMS`, logs in `logs/`, and `.env` values.

---

**Enjoy!** If you want me to tailor the default prompt + hashtag set for AutomateIT’s current campaign, tell me the theme and audience.
