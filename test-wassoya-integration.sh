#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
# SCRIPT DE TEST - INTÉGRATION WASSOYA SMS JÙLABA
# ═══════════════════════════════════════════════════════════════════
# Usage: ./test-wassoya-integration.sh [NUMÉRO_DE_TÉLÉPHONE]
# Exemple: ./test-wassoya-integration.sh 0701020304
# ═══════════════════════════════════════════════════════════════════

set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="gonfmltqggmrieqqbaya"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbmZtbHRxZ2dtcmllcXFiYXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2Njk3NjQsImV4cCI6MjA4ODI0NTc2NH0.N38kxGKxja0tPTYD2ZOEK6-M4wtFQJ5TJ0uttXGAlAk"
API_BASE_URL="https://${PROJECT_ID}.supabase.co/functions/v1/make-server-488793d3"

# Numéro de téléphone (paramètre ou valeur par défaut)
PHONE="${1:-0701020304}"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  TEST D'INTÉGRATION WASSOYA SMS - JÙLABA${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# Vérifier que curl est installé
if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ Erreur: curl n'est pas installé${NC}"
    echo -e "${YELLOW}   Installation: sudo apt-get install curl (Linux) ou brew install curl (Mac)${NC}"
    exit 1
fi

# Vérifier que jq est installé (optionnel, pour le formatage JSON)
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  jq n'est pas installé (optionnel pour un meilleur formatage)${NC}"
    echo -e "${YELLOW}   Installation: sudo apt-get install jq (Linux) ou brew install jq (Mac)${NC}"
    echo ""
    USE_JQ=false
else
    USE_JQ=true
fi

echo -e "${BLUE}📋 Configuration${NC}"
echo -e "   Project ID: ${PROJECT_ID}"
echo -e "   Numéro de test: ${PHONE}"
echo -e "   API URL: ${API_BASE_URL}"
echo ""

# ═══════════════════════════════════════════════════════════════════
# TEST 1 : Health Check
# ═══════════════════════════════════════════════════════════════════

echo -e "${BLUE}🔍 Test 1: Health Check${NC}"
echo -e "${YELLOW}   → Vérification que le backend est accessible...${NC}"

HEALTH_RESPONSE=$(curl -s -X GET "${API_BASE_URL}/health" \
  -H "Authorization: Bearer ${ANON_KEY}")

if [ "$USE_JQ" = true ]; then
    echo "$HEALTH_RESPONSE" | jq '.'
else
    echo "$HEALTH_RESPONSE"
fi

if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}   ✅ Backend opérationnel${NC}"
else
    echo -e "${RED}   ❌ Backend non accessible${NC}"
    exit 1
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
# TEST 2 : Envoi OTP
# ═══════════════════════════════════════════════════════════════════

echo -e "${BLUE}📱 Test 2: Envoi OTP via Wassoya${NC}"
echo -e "${YELLOW}   → Envoi d'un code OTP au numéro ${PHONE}...${NC}"

OTP_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/auth/send-otp" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d "{\"phone\":\"${PHONE}\"}")

if [ "$USE_JQ" = true ]; then
    echo "$OTP_RESPONSE" | jq '.'
else
    echo "$OTP_RESPONSE"
fi

# Analyser la réponse
if echo "$OTP_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}   ✅ Code OTP généré avec succès${NC}"
    
    # Vérifier si le SMS a été délivré
    if echo "$OTP_RESPONSE" | grep -q '"smsDelivered":true'; then
        echo -e "${GREEN}   ✅ SMS envoyé via Wassoya avec succès${NC}"
        echo -e "${GREEN}   🎉 INTÉGRATION WASSOYA OPÉRATIONNELLE !${NC}"
        
        # Afficher le code en mode dev (si présent)
        if echo "$OTP_RESPONSE" | grep -q '"devOnly"'; then
            OTP_CODE=$(echo "$OTP_RESPONSE" | grep -o '"code":"[0-9]*"' | cut -d'"' -f4)
            if [ -n "$OTP_CODE" ]; then
                echo -e "${BLUE}   🔑 Code OTP (dev only): ${OTP_CODE}${NC}"
            fi
        fi
    else
        echo -e "${YELLOW}   ⚠️  SMS non délivré (smsDelivered: false)${NC}"
        echo -e "${YELLOW}   ℹ️  Le code OTP est généré mais le SMS n'a pas été envoyé${NC}"
        echo -e "${YELLOW}   📋 Vérifiez que les secrets Wassoya sont configurés dans Supabase${NC}"
        
        # Afficher l'erreur SMS si présente
        if echo "$OTP_RESPONSE" | grep -q '"smsError"'; then
            SMS_ERROR=$(echo "$OTP_RESPONSE" | grep -o '"smsError":"[^"]*"' | cut -d'"' -f4)
            echo -e "${RED}   ❌ Erreur SMS: ${SMS_ERROR}${NC}"
        fi
        
        # Afficher le code en mode dev (si présent)
        if echo "$OTP_RESPONSE" | grep -q '"devOnly"'; then
            OTP_CODE=$(echo "$OTP_RESPONSE" | grep -o '"code":"[0-9]*"' | cut -d'"' -f4)
            if [ -n "$OTP_CODE" ]; then
                echo -e "${BLUE}   🔑 Code OTP (dev only): ${OTP_CODE}${NC}"
            fi
        fi
    fi
else
    echo -e "${RED}   ❌ Erreur lors de l'envoi du code OTP${NC}"
    
    # Afficher l'erreur
    if echo "$OTP_RESPONSE" | grep -q '"error"'; then
        ERROR_MSG=$(echo "$OTP_RESPONSE" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
        echo -e "${RED}   💬 Message d'erreur: ${ERROR_MSG}${NC}"
    fi
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
# RÉSUMÉ ET PROCHAINES ÉTAPES
# ═══════════════════════════════════════════════════════════════════

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  RÉSUMÉ DU TEST${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

if echo "$OTP_RESPONSE" | grep -q '"smsDelivered":true'; then
    echo -e "${GREEN}✅ SUCCÈS TOTAL${NC}"
    echo -e "   L'intégration Wassoya est 100% opérationnelle !"
    echo -e "   Vous pouvez maintenant utiliser l'authentification OTP par SMS en production."
    echo ""
    echo -e "${BLUE}📱 Vérifiez votre téléphone${NC}"
    echo -e "   Un SMS devrait être arrivé sur le ${PHONE} avec le code OTP."
    echo ""
else
    echo -e "${YELLOW}⚠️  CONFIGURATION REQUISE${NC}"
    echo -e "   Le backend fonctionne mais les SMS ne sont pas envoyés."
    echo ""
    echo -e "${BLUE}📋 Prochaines étapes :${NC}"
    echo ""
    echo -e "   1. Configurez les 3 secrets Wassoya dans Supabase :"
    echo -e "      ${BLUE}→${NC} WASSOYA_API_KEY"
    echo -e "      ${BLUE}→${NC} WASSOYA_API_URL = https://api.wassoya.com/sms/messages"
    echo -e "      ${BLUE}→${NC} WASSOYA_SENDER_ID = JULABA"
    echo ""
    echo -e "   2. Redéployez les Edge Functions :"
    echo -e "      ${BLUE}→${NC} supabase functions deploy make-server-488793d3"
    echo ""
    echo -e "   3. Relancez ce script :"
    echo -e "      ${BLUE}→${NC} ./test-wassoya-integration.sh ${PHONE}"
    echo ""
    echo -e "${BLUE}📚 Documentation :${NC}"
    echo -e "   ${BLUE}→${NC} /GUIDE_RAPIDE_SECRETS_WASSOYA.md"
    echo -e "   ${BLUE}→${NC} /WASSOYA_CONFIGURATION.md"
    echo ""
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# Retourner le code de sortie approprié
if echo "$OTP_RESPONSE" | grep -q '"smsDelivered":true'; then
    exit 0
else
    exit 1
fi
