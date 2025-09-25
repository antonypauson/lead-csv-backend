#!/bin/bash

# Define the API base URL
API_URL="http://localhost:3000/api"

echo "--- Running API Tests for /leads Endpoint ---"
echo "Ensure the Node.js server is running on port 3000."
echo "Ensure test_leads.csv exists in the project root."
echo ""

# Check if test CSV file exists
if [ ! -f "test_leads.csv" ]; then
    echo "ERROR: test_leads.csv file not found in current directory!"
    echo "Please make sure you're running this script from the project root directory."
    echo "Expected file: $(pwd)/test_leads.csv"
    exit 1
fi

echo "Test 1: Uploading valid CSV file (POST $API_URL/leads/upload)"
echo "-----------------------------------------------------------"
curl -X POST -F "csvFile=@test_leads.csv;type=text/csv" "$API_URL/leads/upload"
echo ""
echo ""

echo "Test 2: Uploading invalid file type (should fail)"
echo "-----------------------------------------------"
# This test assumes you have a text file to test with
echo "Creating temporary invalid file for testing..."
echo "This is not a CSV file" > temp_invalid.txt
curl -X POST -F "csvFile=@temp_invalid.txt;type=text/plain" "$API_URL/leads/upload"
rm temp_invalid.txt
echo ""
echo ""

echo "Test 3: Uploading without file (should fail)"
echo "------------------------------------------"
curl -X POST "$API_URL/leads/upload"
echo ""
echo ""

echo "Test 4: Retrieving all uploaded leads (GET $API_URL/leads)"
echo "-------------------------------------------------------"
curl "$API_URL/leads"
echo ""
echo ""

echo "Test 5: Testing API health check (GET $API_URL/)"
echo "----------------------------------------------"
curl "$API_URL/"
echo ""
echo ""

echo "--- API Tests Complete ---"
