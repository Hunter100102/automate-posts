import os
import requests
import openai
from dotenv import load_dotenv

load_dotenv()

# Load secrets
openai.api_key = os.getenv('OPENAI_API_KEY')
linkedin_token = os.getenv('LINKEDIN_ACCESS_TOKEN')
profile_urn = os.getenv('LINKEDIN_PROFILE_URN')

# Step 1: Generate LinkedIn post with OpenAI
def generate_linkedin_post():
    prompt = (
        "Write a professional LinkedIn post from a company called AutomateIT "
        "that helps small businesses improve their operations with custom automation software. "
        "Include a friendly tone and 2-3 relevant hashtags."
    )

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "user", "content": prompt}
        ],
        max_tokens=200
    )

    return response.choices[0].message.content.strip()

# Step 2: Post to LinkedIn
def post_to_linkedin(content):
    headers = {
        "Authorization": f"Bearer {linkedin_token}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
    }

    post_data = {
        "author": profile_urn,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": content
                },
                "shareMediaCategory": "NONE"
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }

    response = requests.post(
        "https://api.linkedin.com/v2/ugcPosts",
        headers=headers,
        json=post_data
    )

    print("Status Code:", response.status_code)
    print("Response:", response.text)

# Run it
if __name__ == "__main__":
    post = generate_linkedin_post()
    print("Generated Post:\n", post)
    post_to_linkedin(post)
