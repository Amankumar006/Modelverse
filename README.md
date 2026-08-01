# 📰 The Modelverse Bot (`themodelversebot`)

> **Official Reddit Bot & Open-Source Catalog Integration for [Modelverse](https://www.themodelverse.in)**

---

## 🌟 App Overview Summary

**The Modelverse Bot (`themodelversebot`)** is an automated community news and foundation model release digest bot created for AI researchers, developers, moderators, and technology enthusiasts on Reddit. 

### What Does The App Do?
The Modelverse Bot tracks, verifies, and publishes daily summaries of major artificial intelligence announcements, foundation model benchmark updates, and open-weights model releases. Instead of unverified rumors or self-promotional spam, `themodelversebot` aggregates verified news items from official lab publications, tech benchmarks, and independent research papers, publishing clean, formatted markdown digests directly to target AI communities (such as r/Modelverse).

### Who Is It For?
- **Subreddit Communities & Redditors**: Stay up-to-date with daily curated AI releases without having to scroll through noise or promotional spam.
- **Subreddit Moderators**: Automate daily community digests with zero maintenance, providing high-value educational content for members.
- **AI Researchers & Enthusiasts**: Access concise summaries, benchmark figures, and direct links to live model specifications and research papers.

### Critical Operational Notes & Safety Protections
- **No Spam / Frequency Capped**: The bot executes a maximum of **once per day**, triggered via automated scheduled workflows. If no new verified articles or model releases occur on a given day, no post is submitted.
- **Read-Only / No User Data Collection**: The bot does **not** track redditors, collect personal information, store credentials, or send direct messages.
- **100% Transparent Attribution**: Every digest clearly identifies article authors, research sources, and provides direct links to published documentation.
- **Moderator & User Control**: Subreddit moderators retain complete control over where the bot posts, and posts adhere strictly to the Reddit User Agreement and Community Guidelines.

---

## 🛠️ How to Configure, Deploy, and Interact

### 1. Prerequisites & Environment Variables

To configure `themodelversebot` for your subreddit or automated workflow, set the following environment variables in your deployment environment or GitHub Repository Secrets:

| Variable Name | Description | Example |
| :--- | :--- | :--- |
| `REDDIT_CLIENT_ID` | OAuth Client ID generated from Reddit App Console | `a1b2c3d4e5f6g7` |
| `REDDIT_CLIENT_SECRET` | OAuth Client Secret from Reddit App Console | `SecretKey_XYZ123...` |
| `REDDIT_USERNAME` | Reddit account username for the bot | `themodelversebot` |
| `REDDIT_PASSWORD` | Account password for OAuth token authorization | `••••••••••••` |
| `REDDIT_SUBREDDIT` | Target subreddit for daily community digests | `Modelverse` |

---

### 2. Manual Local Execution

To test or execute the bot locally from a command-line environment:

```bash
# Clone the repository
git clone https://github.com/Amankumar006/Modelverse.git
cd Modelverse

# Install dependencies
npm install

# Set environment variables (or configure .env.local)
export REDDIT_CLIENT_ID="your_client_id"
export REDDIT_CLIENT_SECRET="your_client_secret"
export REDDIT_USERNAME="themodelversebot"
export REDDIT_PASSWORD="your_password"
export REDDIT_SUBREDDIT="Modelverse"

# Execute the Reddit posting script
node scripts/post-to-reddit.js
```

---

### 3. Automated Deployment Workflow (GitHub Actions)

`themodelversebot` is designed to run automatically via GitHub Actions:
- Workflow file: `.github/workflows/daily-ingestion.yml`
- Schedule: Runs daily at `00:00 UTC`.
- Flow:
  1. Ingests latest verified AI news and model releases.
  2. Runs verification checks (`scripts/verify-news.js`) to prevent hallucinations or broken links.
  3. Formats clean markdown digest (`data/ingestion/new-articles.json`).
  4. Triggers `scripts/post-to-reddit.js` to publish the community digest post.

---

## 🔒 Privacy, Safety & Content Policy Compliance

- **Approved LLMs & Verification**: All digested news items are cross-checked against official lab publications and Google Gemini verification pipelines before publishing.
- **Data Minimization**: Stores zero user data, cookies, or tracking identifiers.
- **No External Linking Scams**: Links strictly direct to verified model cards on [themodelverse.in](https://www.themodelverse.in) or original lab research papers.
- **Open Source**: The bot codebase is open source and available for public review.

---

## 📬 Contact & Support

For support, feature requests, or moderator inquiries regarding `themodelversebot`:
- **Website**: [https://www.themodelverse.in](https://www.themodelverse.in)
- **Reddit**: Contact [/u/Subject_Ad_5799](https://www.reddit.com/user/Subject_Ad_5799/) or modmail on r/Modelverse.
- **GitHub**: [Amankumar006/Modelverse](https://github.com/Amankumar006/Modelverse)
