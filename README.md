![Spec Badge](https://img.shields.io/badge/Project_Spec-No._01_Triage_Engine-purple?style=for-the-badge)
# Sentinel AI — Real-Time Customer Triage Engine
An automated, LLM-powered support ticket classification and triage system built for high-volume SaaS applications. Sentinel ingests raw customer tickets, enforces structured JSON schema analysis via LLM tool-calling, and flags churn risk and urgent enterprise tickets in real-time.

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
