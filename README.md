![Spec Badge](https://img.shields.io/badge/Project_Spec-No._01_Triage_Engine-purple?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0-blue?style=for-the-badge)
# Sentinel AI — Real-Time Customer Triage Engine

Version 1.0 delivers a focused AI triage workflow for support teams: it ingests customer tickets, classifies urgency and sentiment with structured LLM analysis, stores the results in a lightweight ticket pipeline, and surfaces priority items for faster response handling. The current project includes ticket intake, validation, automated triage rules, and a dashboard view for reviewing queued issues.

## Core Features
* **Structured Sentiment & Urgency Analysis:** Extracts categorizations, sentiment, and urgency scores ($1-10$) using strict schema validation.
* **Automated Rule Engine:** Instantly routes high-urgency or negative-sentiment enterprise tickets to a priority pipeline.
* **Agent Dashboard:** Real-time queue for support teams with AI-generated ticket summaries and contextual response drafting.
* **Prompt Injection Defense:** Input sanitization layer to prevent prompt hijacking from incoming ticket text.

## Tech Stack
* **Frontend:** React / Next.js, Tailwind CSS
* **Backend:** Node.js (Express/FastAPI)
* **AI/LLM:** OpenAI API / Gemini API (Structured Outputs / Function Calling)
* **Database:** PostgreSQL / MongoDB
* **Testing:** Vitest / Jest (Unit & Integration)

## Getting Started

### Prerequisites
* Node.js v18+
* API Key (OpenAI or Gemini)
