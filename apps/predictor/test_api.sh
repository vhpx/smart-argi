#!/bin/bash

# Base URL for the API
API_URL="https://hajiwansau15--agri-price-forecast-api-fastapi-app.modal.run"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to make API calls and check response
test_endpoint() {
    local endpoint=$1
    local params=$2
    local description=$3
    local timeout=${4:-900}  # Default timeout of 900 seconds (15 minutes)
    
    echo -e "\n${BLUE}Testing: ${description}${NC}"
    echo "URL: ${API_URL}${endpoint}${params}"
    echo -e "${YELLOW}Timeout set to ${timeout} seconds${NC}"
    
    # Create temporary files for response body and headers
    response_file=$(mktemp)
    headers_file=$(mktemp)
    
    # Make the curl request with timing information
    echo "Waiting for response..."
    start_time=$(date +%s)
    
    curl -s -w '\nTime taken: %{time_total}s\n' \
         -D "$headers_file" \
         --max-time "$timeout" \
         -L \
         "${API_URL}${endpoint}${params}" > "$response_file"
    
    curl_exit_code=$?
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    http_code=$(cat "$headers_file" | grep "HTTP/" | tail -1 | awk '{print $2}')
    
    if [ $curl_exit_code -eq 0 ] && { [ "$http_code" = "200" ] || [ "$http_code" = "303" ]; }; then
        echo -e "${GREEN}✓ Success (HTTP $http_code) - Completed in ${duration}s${NC}"
        echo "Response preview:"
        cat "$response_file" | python3 -m json.tool || cat "$response_file"
    else
        echo -e "${RED}✗ Failed${NC}"
        if [ $curl_exit_code -eq 28 ]; then
            echo "Error: Request timed out after ${timeout} seconds"
        else
            echo "Error: HTTP Status $http_code"
            cat "$response_file"
            echo "Curl exit code: $curl_exit_code"
        fi
    fi
    
    # Cleanup temporary files
    rm -f "$response_file" "$headers_file"
    echo "----------------------------------------"
    
    # Return success for both 200 and 303 (redirect) responses
    [ "$http_code" = "200" ] || [ "$http_code" = "303" ]
    return $?
}

echo "🚀 Starting API Tests..."

# Test health check endpoint first
test_endpoint "/health" "" "Health Check" 30

# Only proceed with other tests if health check passes
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}Health check passed. Proceeding with endpoint tests...${NC}"
    
    # Test /forecast endpoint with longer timeout
    test_endpoint "/forecast" "" "Forecast with default horizon (h=12)" 900
    test_endpoint "/forecast" "?h=24" "Forecast with h=24" 900

    # Test /statistical_metrics endpoint
    test_endpoint "/statistical_metrics" "" "Statistical metrics with default horizon (h=12)" 900
    test_endpoint "/statistical_metrics" "?h=24" "Statistical metrics with h=24" 900

    # Test /ml_metrics endpoint
    test_endpoint "/ml_metrics" "" "ML metrics with default horizon (h=12)" 900
    test_endpoint "/ml_metrics" "?h=24" "ML metrics with h=24" 900
else
    echo -e "${RED}Health check failed. Skipping remaining tests.${NC}"
    exit 1
fi

echo -e "\n✨ API Testing Complete!" 