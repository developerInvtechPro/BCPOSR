#!/bin/bash
echo "🚀 Iniciando Sistema POS..."
export PORT=3000
export ESLINT_NO_DEV_ERRORS=true
npm run dev 2>&1 | tee logs/app.log
