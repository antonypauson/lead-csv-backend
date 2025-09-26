#!/bin/bash

echo "--- 1. Creating a new Offer ---"
OFFER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/offers \
-H "Content-Type: application/json" \
-d '{
  "name": "AI-Powered Sales Lead Qualification",
  "value_props": [
    "Automate lead scoring",
    "Improve sales efficiency",
    "Focus on high-intent prospects"
  ],
  "ideal_use_cases": [
    "SaaS Sales Teams",
    "B2B Marketing Agencies",
    "Enterprise Lead Generation"
  ]
}')
echo "$OFFER_RESPONSE"
OFFER_ID=$(echo "$OFFER_RESPONSE" | grep -oP '"id":"\K[^"]+')
echo "Extracted Offer ID: $OFFER_ID"
echo ""

echo "--- 2. Uploading Leads from test_leads.csv ---"
LEADS_UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:3000/api/leads/upload \
-F "csvFile=@test_leads.csv;type=text/csv")
echo "$LEADS_UPLOAD_RESPONSE"
echo ""

echo "--- 3. Getting all uploaded Leads to extract IDs ---"
ALL_LEADS_RESPONSE=$(curl -s http://localhost:3000/api/leads)
echo "$ALL_LEADS_RESPONSE"
# Extract lead IDs from nested batch structure (fallback without jq)
LEAD_IDS=$(echo "$ALL_LEADS_RESPONSE" | grep -oP '"id":"\K[^"]+' | tr '\n' ',' | sed 's/,$//')
echo "Extracted Lead IDs: $LEAD_IDS"
echo ""

echo "--- 4. Scoring Leads with the created Offer ---"
# Convert comma-separated LEAD_IDS into a JSON array format
LEAD_IDS_JSON_ARRAY=$(echo "$LEAD_IDS" | awk -F',' '{
    printf "["
    for (i=1; i<=NF; i++) {
        printf "\"%s\"", $i
        if (i < NF) printf ","
    }
    printf "]"
}')

SCORE_LEADS_RESPONSE=$(curl -s -X POST http://localhost:3000/api/score \
-H "Content-Type: application/json" \
-d "{
  \"offerId\": \"$OFFER_ID\",
  \"leadIds\": $LEAD_IDS_JSON_ARRAY
}")
echo "$SCORE_LEADS_RESPONSE"
echo ""

echo "--- 5. Getting all Scoring Results ---"
curl -s http://localhost:3000/api/results
echo ""
