#!/usr/bin/env bash
# ============================================================
# test-flow.sh — Smoke test end-to-end del flujo de pr_ledger
# Uso:  ./test-flow.sh
# Requiere: curl, jq  (brew install jq / apt install jq)
# ============================================================

set -euo pipefail

BASE="${BASE:-http://localhost:3004}"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

ok()      { echo -e "${GREEN}✓${RESET} $1"; }
fail()    { echo -e "${RED}✗${RESET} $1"; }
info()    { echo -e "${CYAN}ℹ${RESET} $1"; }
section() { echo -e "\n${BOLD}${YELLOW}=== $1 ===${RESET}"; }

# ------------------------------------------------------------
# Chequeos previos
# ------------------------------------------------------------
command -v curl >/dev/null 2>&1 || { fail "curl no está instalado"; exit 1; }
command -v jq   >/dev/null 2>&1 || { fail "jq no está instalado (brew install jq / apt install jq)"; exit 1; }

section "Ping al server"
if ! curl -sf -o /dev/null "$BASE/accounts?type=ASSET"; then
  fail "No responde $BASE — ¿está corriendo el server?"
  exit 1
fi
ok "Server responde en $BASE"

# ------------------------------------------------------------
# Bloque 1 — crear cuenta A
# ------------------------------------------------------------
section "1. Crear cuenta A (ASSET/USD)"

ACC_A=$(curl -s -X POST "$BASE/accounts" \
  -H "Content-Type: application/json" \
  -d '{"ownerId":"user-1","type":"ASSET","currencyCode":"USD"}' \
  | jq -r .id)

[ -n "$ACC_A" ] && [ "$ACC_A" != "null" ] || { fail "No se pudo crear cuenta A"; exit 1; }
ok "ACC_A=$ACC_A"

# ------------------------------------------------------------
# Bloque 2 — activar A
# ------------------------------------------------------------
section "2. Activar cuenta A"

STATUS_A=$(curl -s -X POST "$BASE/accounts/$ACC_A/activate" | jq -r .status)
[ "$STATUS_A" = "ACTIVE" ] && ok "A está ACTIVE" || fail "A quedó en $STATUS_A"

# ------------------------------------------------------------
# Bloque 3 — crear cuenta B
# ------------------------------------------------------------
section "3. Crear cuenta B (ASSET/USD)"

ACC_B=$(curl -s -X POST "$BASE/accounts" \
  -H "Content-Type: application/json" \
  -d '{"ownerId":"user-2","type":"ASSET","currencyCode":"USD"}' \
  | jq -r .id)

[ -n "$ACC_B" ] && [ "$ACC_B" != "null" ] || { fail "No se pudo crear cuenta B"; exit 1; }
ok "ACC_B=$ACC_B"

# ------------------------------------------------------------
# Bloque 4 — activar B
# ------------------------------------------------------------
section "4. Activar cuenta B"

STATUS_B=$(curl -s -X POST "$BASE/accounts/$ACC_B/activate" | jq -r .status)
[ "$STATUS_B" = "ACTIVE" ] && ok "B está ACTIVE" || fail "B quedó en $STATUS_B"

# ------------------------------------------------------------
# Bloque 5 — listar por tipo
# ------------------------------------------------------------
section "5. Listar cuentas ASSET"

COUNT=$(curl -s "$BASE/accounts?type=ASSET" | jq 'length')
info "Cuentas ASSET encontradas: $COUNT"

# ------------------------------------------------------------
# Bloque 6 — transferencia A → B (100.00)
# ------------------------------------------------------------
section "6. Transferencia A → B (100.00 USD)"

TX_JSON=$(curl -s -X POST "$BASE/transfers" \
  -H "Content-Type: application/json" \
  -d "{
    \"sourceAccountId\": \"$ACC_A\",
    \"destinationAccountId\": \"$ACC_B\",
    \"amount\": \"100.00\",
    \"currencyCode\": \"USD\",
    \"reference\": \"test-1\"
  }")

TX_ID=$(echo "$TX_JSON" | jq -r .id)
TX_STATUS=$(echo "$TX_JSON" | jq -r .status)

[ "$TX_STATUS" = "POSTED" ] && ok "TX $TX_ID POSTED" || fail "TX quedó en $TX_STATUS"
echo "$TX_JSON" | jq '{id, reference, status, entries: [.entries[] | {direction, amount, accountId}]}'

# ------------------------------------------------------------
# Bloque 7 — verificar saldos
# ------------------------------------------------------------
section "7. Saldos después de la transferencia"

BAL_A=$(curl -s "$BASE/accounts/$ACC_A" | jq -r .balance)
BAL_B=$(curl -s "$BASE/accounts/$ACC_B" | jq -r .balance)

info "A (origen)   : $BAL_A"
info "B (destino)  : $BAL_B"

# Comparación laxa (Decimal se serializa como "−100.0000" o "-100.0000")
[[ "$BAL_A" == -100* ]] && ok "A quedó negativa (correcto)" || fail "A esperaba -100, obtuve $BAL_A"
[[ "$BAL_B" ==  100* ]] && ok "B quedó positiva (correcto)" || fail "B esperaba +100, obtuve $BAL_B"

# ------------------------------------------------------------
# Bloque 8 — segunda transferencia + get tx
# ------------------------------------------------------------
section "8. Segunda transferencia + GET /transactions/:id"

TX2_ID=$(curl -s -X POST "$BASE/transfers" \
  -H "Content-Type: application/json" \
  -d "{
    \"sourceAccountId\": \"$ACC_A\",
    \"destinationAccountId\": \"$ACC_B\",
    \"amount\": \"50.00\",
    \"currencyCode\": \"USD\",
    \"reference\": \"test-2\"
  }" | jq -r .id)

GOT_TX=$(curl -s "$BASE/transactions/$TX2_ID" | jq -r .id)
[ "$GOT_TX" = "$TX2_ID" ] && ok "GET /transactions/$TX2_ID OK" || fail "GET devolvió $GOT_TX"

# ------------------------------------------------------------
# Bloque 9 — casos de error
# ------------------------------------------------------------
section "9a. Transfer a la misma cuenta (esperado: 500 hoy)"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/transfers" \
  -H "Content-Type: application/json" \
  -d "{
    \"sourceAccountId\": \"$ACC_A\",
    \"destinationAccountId\": \"$ACC_A\",
    \"amount\": \"10.00\",
    \"currencyCode\": \"USD\",
    \"reference\": \"test-same\"
  }")
info "HTTP $CODE (hoy 500; cuando agregues DomainError+filter → 422)"

section "9b. Monto inválido (esperado: 400)"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/transfers" \
  -H "Content-Type: application/json" \
  -d "{
    \"sourceAccountId\": \"$ACC_A\",
    \"destinationAccountId\": \"$ACC_B\",
    \"amount\": \"abc\",
    \"currencyCode\": \"USD\",
    \"reference\": \"test-bad-amount\"
  }")

[ "$CODE" = "400" ] && ok "400 (ValidationPipe hizo su trabajo)" || fail "Esperaba 400, obtuve $CODE"

section "9c. Transfer a cuenta INACTIVE (esperado: 500 hoy)"

ACC_C=$(curl -s -X POST "$BASE/accounts" \
  -H "Content-Type: application/json" \
  -d '{"ownerId":"user-3","type":"ASSET","currencyCode":"USD"}' | jq -r .id)

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/transfers" \
  -H "Content-Type: application/json" \
  -d "{
    \"sourceAccountId\": \"$ACC_A\",
    \"destinationAccountId\": \"$ACC_C\",
    \"amount\": \"10.00\",
    \"currencyCode\": \"USD\",
    \"reference\": \"test-inactive\"
  }")
info "HTTP $CODE (hoy 500; cuando agregues DomainError+filter → 422)"

section "9d. Flujo create DRAFT → post"

TX_DRAFT=$(curl -s -X POST "$BASE/transactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"reference\": \"draft-1\",
    \"occurredAt\": \"2026-10-10T00:00:00.000Z\",
    \"entries\": [
      { \"accountId\": \"$ACC_A\", \"direction\": \"CREDIT\", \"amount\": \"25.00\", \"currency\": \"USD\" },
      { \"accountId\": \"$ACC_B\", \"direction\": \"DEBIT\",  \"amount\": \"25.00\", \"currency\": \"USD\" }
    ]
  }" | jq -r .id)

DRAFT_STATUS=$(curl -s "$BASE/transactions/$TX_DRAFT" | jq -r .status)
[ "$DRAFT_STATUS" = "DRAFT" ] && ok "DRAFT creado sin mover saldos" || fail "Esperaba DRAFT, obtuve $DRAFT_STATUS"

POSTED_STATUS=$(curl -s -X POST "$BASE/transactions/$TX_DRAFT/post" | jq -r .status)
[ "$POSTED_STATUS" = "POSTED" ] && ok "DRAFT posteado" || fail "Esperaba POSTED, obtuve $POSTED_STATUS"

# ------------------------------------------------------------
# Bloque 10 — estado final
# ------------------------------------------------------------
section "10. Estado final"

echo "--- Cuentas ASSET ---"
curl -s "$BASE/accounts?type=ASSET" | jq '.[] | {id, ownerId, status, balance}'

echo -e "\n--- TX_DRAFT ---"
curl -s "$BASE/transactions/$TX_DRAFT" | jq '{id, status, postedAt}'

echo ""
ok "Smoke test terminado."
