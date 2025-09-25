#!/bin/bash

# Define the API base URL
API_URL="http://localhost:3000/api"

echo "--- Running API Tests for /offers Endpoint ---"
echo "Ensure the Node.js server is running on port 3000."
echo ""

# POST Requests
echo "Test 1: Creating a valid offer (POST $API_URL/offers)"
echo "---------------------------------------------------"
curl -X POST "$API_URL/offers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Outreach Automation",
    "value_props": ["24/7 outreach", "6x more meetings"],
    "ideal_use_cases": ["B2B SaaS mid-market"]
  }'
echo ""
echo ""

echo "Test 2: Creating an invalid offer (missing name) (POST $API_URL/offers)"
echo "--------------------------------------------------------------------"
curl -X POST "$API_URL/offers" \
  -H "Content-Type: application/json" \
  -d '{
    "value_props": ["test prop"],
    "ideal_use_cases": ["test case"]
  }'
echo ""
echo ""

echo "Test 3: Creating an invalid offer (multiple errors) (POST $API_URL/offers)"
echo "-----------------------------------------------------------------------"
curl -X POST "$API_URL/offers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "value_props": [],
    "ideal_use_cases": ["test case"]
  }'
echo ""
echo ""

# GET Request
echo "Test 4: Retrieving all stored offers (GET $API_URL/offers)"
echo "-------------------------------------------------------"
curl "$API_URL/offers"
echo ""
echo ""

echo "--- API Tests Complete ---"
