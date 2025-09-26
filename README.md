# Lead Qualification Backend

## Overview
This project implements a backend service for automated lead qualification. It scores leads based on a combination of rule-based logic and AI analysis, helping sales teams focus on high-intent prospects. The system allows for defining offers, uploading lead data via CSV, and then scoring these leads against a specific offer to determine their buying intent.

## Features
- **Offer Management**: Create and retrieve sales offer details.
- **Lead Upload**: Upload lead data via CSV files for processing.
- **Rule-Based Scoring**: Evaluate leads based on predefined criteria like role, industry, and data completeness.
- **AI-Powered Scoring**: Utilize the Groq API with the `llama-3.1-8b-instant` model for nuanced buying intent analysis.
- **Lead Scoring Pipeline**: Combine rule-based and AI scores to determine a final intent classification (High, Medium, Low).
- **Results Retrieval**: Access detailed scoring results and a summary of lead intent distribution.
- **API Documentation**: Clear API endpoints with examples.

## Setup & Installation

### Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/lead-intent-scorer.git
    cd lead-intent-scorer
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the `lead-intent-scorer` directory based on `.env.example`:
    ```
    NODE_ENV=development
    PORT=3000
    GROQ_API_KEY=your_groq_api_key_here
    ```
    Replace `your_groq_api_key_here` with your actual Groq API key.

4.  **Start the server:**
    ```bash
    npm start
    ```
    The server will run on `http://localhost:3000`.

## API Documentation

The API base URL for the deployed application is `https://lead-csv-backend.onrender.com/api`.
For local development, use `http://localhost:3000/api`.

### Endpoints

#### 1. Create Offer

-   **Endpoint**: `POST /api/offers`
-   **Description**: Creates a new sales offer.
-   **Request Body (JSON)**:
    ```json
    {
      "name": "string (required)",
      "value_props": ["array of strings (required)"],
      "ideal_use_cases": ["array of strings (required)"]
    }
    ```
-   **Example (cURL)**:
    ```bash
    curl -X POST "https://lead-csv-backend.onrender.com/api/offers" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "AI Outreach Automation",
        "value_props": ["24/7 outreach", "6x more meetings"],
        "ideal_use_cases": ["B2B SaaS mid-market"]
      }'
    ```

#### 2. Get All Offers

-   **Endpoint**: `GET /api/offers`
-   **Description**: Retrieves all stored offers.
-   **Example (cURL)**:
    ```bash
    curl "https://lead-csv-backend.onrender.com/api/offers"
    ```

#### 3. Upload Leads CSV

-   **Endpoint**: `POST /api/leads/upload`
-   **Description**: Uploads a CSV file containing lead data.
-   **CSV Format Expected**:
    ```
    name,role,company,industry,location,linkedin_bio
    John Smith,CEO,TechCorp,Software,San Francisco,"Experienced CEO in SaaS..."
    Jane Doe,Marketing Manager,Innovate Inc.,Marketing,London,"Passionate about digital marketing strategies."
    ```
-   **Example (cURL)**:
    ```bash
    # Assuming you have a 'test_leads.csv' file in your current directory
    curl -X POST -F "csvFile=@test_leads.csv;type=text/csv" "https://lead-csv-backend.onrender.com/api/leads/upload"
    ```

#### 4. Get All Leads

-   **Endpoint**: `GET /api/leads`
-   **Description**: Retrieves all processed leads data.
-   **Example (cURL)**:
    ```bash
    curl "https://lead-csv-backend.onrender.com/api/leads"
    ```

#### 5. Score Leads

-   **Endpoint**: `POST /api/score`
-   **Description**: Processes a batch of leads for scoring based on a specific offer.
-   **Request Body (JSON)**:
    ```json
    {
      "offerId": "string (required, ID of a previously created offer)",
      "leadIds": ["array of strings (required, IDs of previously uploaded leads)"]
    }
    ```
-   **Example (cURL)**:
    ```bash
    # Replace <OFFER_ID> and <LEAD_ID_1>, <LEAD_ID_2> with actual IDs
    curl -X POST "https://lead-csv-backend.onrender.com/api/score" \
      -H "Content-Type: application/json" \
      -d '{
        "offerId": "654321",
        "leadIds": ["lead-abc", "lead-xyz"]
      }'
    ```

#### 6. Get Scoring Results

-   **Endpoint**: `GET /api/results`
-   **Description**: Retrieves all stored lead scoring results with a summary.
-   **Response Format (JSON)**:
    ```json
    {
      "results": [
        {
          "id": "uuid",
          "name": "Ava Patel",
          "role": "Head of Growth",
          "company": "FlowMetrics",
          "industry": "SaaS",
          "location": "New York",
          "intent": "High",
          "score": 85,
          "rule_score": 50,
          "ai_score": 35,
          "reasoning": "Decision maker in target SaaS industry with growth focus",
          "processed_at": "2024-01-15T10:30:00Z"
        }
      ],
      "summary": {
        "total_leads": 100,
        "high_intent": 15,
        "medium_intent": 45,
        "low_intent": 40,
        "average_score": 42.5
      }
    }
    ```
-   **Example (cURL)**:
    ```bash
    curl "https://lead-csv-backend.onrender.com/api/results"
    ```

### Rule Logic Explanation

The rule-based scoring system assigns points to leads based on their profile attributes, up to a maximum of 50 points.

-   **Role Classification**:
    -   Decision Makers (CEO, CTO, VP, Director, Head of, Founder): 20 points
    -   Influencers (Manager, Lead, Senior, Principal): 10 points
    -   Others: 0 points
-   **Industry Matching**:
    -   Exact match with `ideal_use_cases` from the offer: 20 points
    -   Adjacent/related industries: 10 points
    -   No match: 0 points
-   **Data Completeness**:
    -   All required fields (`name`, `role`, `company`, `industry`, `location`, `linkedin_bio`) present: 10 points

### AI Service and Model Used

The AI integration uses the **Groq API** with the **`llama-3.1-8b-instant`** model. This model is leveraged to provide a nuanced analysis of a prospect's buying intent.

#### AI Prompt Template

The following template is used to generate prompts for the AI, providing comprehensive context about the offer and the prospect:

```
You are an expert B2B sales analyst. Analyze this prospect's buying intent for our offer.

OFFER DETAILS:
Product: {offer_name}
Value Propositions: {value_props}
Ideal Use Cases: {ideal_use_cases}

PROSPECT PROFILE:
Name: {name}
Role: {role}
Company: {company}
Industry: {industry}
Location: {location}
LinkedIn Bio: {bio}

RULE-BASED CONTEXT:
- Role Classification: {role_category} ({role_reasoning})
- Industry Match: {industry_match_type} ({industry_reasoning})
- Profile Completeness: {completeness_percentage}%

ANALYSIS TASK:
Based on the prospect's profile, role, company context, and LinkedIn bio, classify their buying intent as High, Medium, or Low. Consider:

1. **Role Relevance**: Do they have decision-making power or influence over purchasing decisions?
2. **Industry Fit**: How well does their industry align with our ideal use cases?
3. **Pain Points**: Does their bio or role suggest they face problems our product solves?
4. **Company Context**: Are they at a company size/stage that would benefit from our solution?
5. **Timing Signals**: Any indicators of growth, expansion, or current challenges?

RESPONSE FORMAT:
INTENT: [High/Medium/Low]
REASONING: [Provide 1-2 sentences explaining your classification, focusing on the most important factors that influenced your decision]

Example:
INTENT: High
REASONING: VP of Sales at a mid-market SaaS company with bio mentioning "scaling outreach efforts" - perfect role authority and explicit pain point alignment with automation solution.
```

## Testing

To run unit tests:
```bash
npm test
```

## Deployment

The application is deployed on Render and is accessible at: `https://lead-csv-backend.onrender.com`

### Render Configuration

-   **Build Command**: `npm install`
-   **Start Command**: `npm start`
-   **Environment Variables**:
    -   `NODE_ENV`: `production`
    -   `PORT`: (Optional, Render auto-assigns)
    -   `OPENAI_API_KEY`: Your Groq API key.

## Architecture

The application follows a service-oriented architecture with distinct layers:
-   **Controllers**: Handle HTTP requests and responses.
-   **Services**: Encapsulate business logic (e.g., `ruleScoring.service.js`, `aiScoring.service.js`).
-   **Models**: Represent data structures (currently in-memory).
-   **Routes**: Define API endpoints.
-   **Middleware**: Manages cross-cutting concerns like file uploads and validation.
-   **Utils**: Provides helper functions and common utilities.

The system uses in-memory storage for offers and leads, which is suitable for the current scope of the project.
