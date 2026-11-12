#!/usr/bin/env bash
set -e

# ==============================================================================
# SyncSpace End-to-End (E2E) Test Suite
# Tests full flow: Auth -> Workspaces -> Docs -> Markdown -> Sharing -> RBAC -> Uploads
# ==============================================================================

BASE_URL="http://localhost:8080"
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Starting SyncSpace Comprehensive E2E Verification ===${NC}\n"

# Test 1: Health Check
echo -n "Test 1: Health Check endpoint (/api/health)... "
HEALTH=$(curl -s "$BASE_URL/api/health")
if [[ "$HEALTH" == *"UP"* ]]; then
  echo -e "${GREEN}PASSED${NC}"
else
  echo -e "${RED}FAILED ($HEALTH)${NC}"; exit 1
fi

# Test 2: User A Registration & Login
echo -n "Test 2: Register & Login Alice (alice@college.edu)... "
curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@college.edu","password":"password123","fullName":"Alice Smith"}' > /dev/null

LOGIN_A=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@college.edu","password":"password123"}')

TOKEN_A=$(echo "$LOGIN_A" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -n "$TOKEN_A" ]; then
  echo -e "${GREEN}PASSED (JWT Acquired)${NC}"
else
  echo -e "${RED}FAILED${NC}"; exit 1
fi

# Test 3: User B Registration & Login
echo -n "Test 3: Register & Login Bob (bob@college.edu)... "
curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@college.edu","password":"password123","fullName":"Bob Jones"}' > /dev/null

LOGIN_B=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@college.edu","password":"password123"}')

TOKEN_B=$(echo "$LOGIN_B" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -n "$TOKEN_B" ]; then
  echo -e "${GREEN}PASSED (JWT Acquired)${NC}"
else
  echo -e "${RED}FAILED${NC}"; exit 1
fi

# Test 4: Workspace Creation by Alice
echo -n "Test 4: Workspace creation by Alice... "
WS_RESP=$(curl -s -X POST "$BASE_URL/api/workspaces" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"name":"Software Engineering Lab","description":"Collaborative coursework notes"}')
WS_ID=$(echo "$WS_RESP" | grep -o '"id":[^,]*' | head -n1 | cut -d':' -f2)

if [ -n "$WS_ID" ]; then
  echo -e "${GREEN}PASSED (Workspace ID: $WS_ID)${NC}"
else
  echo -e "${RED}FAILED ($WS_RESP)${NC}"; exit 1
fi

# Test 5: Document Creation by Alice in Workspace
echo -n "Test 5: Document Creation with Markdown... "
DOC_RESP=$(curl -s -X POST "$BASE_URL/api/documents" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Sprint 1 Architecture\",\"content\":\"# Sprint 1\\n\\nInitial system design.\",\"workspaceId\":$WS_ID}")
DOC_ID=$(echo "$DOC_RESP" | grep -o '"id":[^,]*' | head -n1 | cut -d':' -f2)

if [ -n "$DOC_ID" ]; then
  echo -e "${GREEN}PASSED (Document ID: $DOC_ID)${NC}"
else
  echo -e "${RED}FAILED ($DOC_RESP)${NC}"; exit 1
fi

# Test 6: Document Update by Alice
echo -n "Test 6: Update Document Markdown Content... "
UPDATE_RESP=$(curl -s -X PUT "$BASE_URL/api/documents/$DOC_ID" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Sprint 1 Architecture Updated\",\"content\":\"# Sprint 1 Updated\\n\\n- Component diagram\\n- Sequence diagram\"}")
if [[ "$UPDATE_RESP" == *"Sprint 1 Architecture Updated"* ]]; then
  echo -e "${GREEN}PASSED${NC}"
else
  echo -e "${RED}FAILED ($UPDATE_RESP)${NC}"; exit 1
fi

# Test 7: Unauthorized Access by Bob (Before Sharing)
echo -n "Test 7: RBAC - Bob attempts to read unshared doc (expect 403)... "
UNAUTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/documents/$DOC_ID" \
  -H "Authorization: Bearer $TOKEN_B")
if [ "$UNAUTH_CODE" -eq 403 ]; then
  echo -e "${GREEN}PASSED (HTTP 403 Forbidden correctly enforced)${NC}"
else
  echo -e "${RED}FAILED (Got HTTP $UNAUTH_CODE)${NC}"; exit 1
fi

# Test 8: Share Document with Bob as EDITOR
echo -n "Test 8: Alice shares doc with Bob as EDITOR... "
SHARE_RESP=$(curl -s -X POST "$BASE_URL/api/documents/$DOC_ID/share" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@college.edu","role":"EDITOR"}')
if [[ "$SHARE_RESP" == *"EDITOR"* ]]; then
  echo -e "${GREEN}PASSED${NC}"
else
  echo -e "${RED}FAILED ($SHARE_RESP)${NC}"; exit 1
fi

# Test 9: Bob edits shared document
echo -n "Test 9: Bob updates shared document as EDITOR (expect 200)... "
BOB_EDIT=$(curl -s -X PUT "$BASE_URL/api/documents/$DOC_ID" \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Sprint 1 - Reviewed by Bob\",\"content\":\"# Sprint 1\\n\\nBob reviewed this.\",\"workspaceId\":$WS_ID}")
if [[ "$BOB_EDIT" == *"Reviewed by Bob"* ]]; then
  echo -e "${GREEN}PASSED${NC}"
else
  echo -e "${RED}FAILED ($BOB_EDIT)${NC}"; exit 1
fi

# Test 10: Unauthorized Delete Check (Bob tries to delete Alice's doc)
echo -n "Test 10: RBAC - Bob attempts to DELETE Alice's doc (expect 403)... "
BOB_DEL_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/documents/$DOC_ID" \
  -H "Authorization: Bearer $TOKEN_B")
if [ "$BOB_DEL_CODE" -eq 403 ]; then
  echo -e "${GREEN}PASSED (HTTP 403 Forbidden correctly enforced)${NC}"
else
  echo -e "${RED}FAILED (Got HTTP $BOB_DEL_CODE)${NC}"; exit 1
fi

# Test 11: Image Upload Endpoint
echo -n "Test 11: Image Upload (/api/uploads)... "
echo "fake-image-bytes" > /tmp/test_diagram.png
UPLOAD_RESP=$(curl -s -X POST "$BASE_URL/api/uploads" \
  -H "Authorization: Bearer $TOKEN_A" \
  -F "file=@/tmp/test_diagram.png")
UPLOAD_URL=$(echo "$UPLOAD_RESP" | grep -o '"url":"[^"]*' | cut -d'"' -f4)

if [ -n "$UPLOAD_URL" ]; then
  # Test static retrieval of uploaded file (UPLOAD_URL is full URL)
  IMG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$UPLOAD_URL")
  if [ "$IMG_STATUS" -eq 200 ]; then
    echo -e "${GREEN}PASSED (Uploaded & Served at $UPLOAD_URL)${NC}"
  else
    echo -e "${RED}FAILED to serve file (HTTP $IMG_STATUS)${NC}"; exit 1
  fi
else
  echo -e "${RED}FAILED ($UPLOAD_RESP)${NC}"; exit 1
fi

# Test 12: OAuth2 / Social Login delegation endpoint
echo -n "Test 12: OAuth Delegation Flow (/api/auth/oauth)... "
OAUTH_RESP=$(curl -s -X POST "$BASE_URL/api/auth/oauth" \
  -H "Content-Type: application/json" \
  -d '{"email":"charlie.google@college.edu","fullName":"Charlie Google User","provider":"GOOGLE"}')
OAUTH_TOKEN=$(echo "$OAUTH_RESP" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -n "$OAUTH_TOKEN" ]; then
  echo -e "${GREEN}PASSED (OAuth JWT generated)${NC}"
else
  echo -e "${RED}FAILED ($OAUTH_RESP)${NC}"; exit 1
fi

# Test 13: Clean up - Alice deletes her document
echo -n "Test 13: Owner (Alice) deletes Document (expect 200)... "
DEL_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/documents/$DOC_ID" \
  -H "Authorization: Bearer $TOKEN_A")
if [ "$DEL_CODE" -eq 200 ] || [ "$DEL_CODE" -eq 204 ]; then
  echo -e "${GREEN}PASSED (HTTP $DEL_CODE)${NC}"
else
  echo -e "${RED}FAILED (HTTP $DEL_CODE)${NC}"; exit 1
fi

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}ALL 13 END-TO-END TESTS PASSED SUCCESSFULLY! 🚀${NC}"
echo -e "${GREEN}======================================================${NC}"
