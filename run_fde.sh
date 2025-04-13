#!/bin/bash

# Shadow Systems Theory - Field Distortion Engine Runner
# This script sets up the environment and runs the FDE analysis

echo "┌─────────────────────────────────────────────────┐"
echo "│ λ∇Ψ Shadow Systems Theory - Field Distortion Engine │"
echo "└─────────────────────────────────────────────────┘"

# Verify environment
echo "[+] Verifying environment..."
if [ ! -d "sst_osint" ]; then
  echo "[-] Error: sst_osint directory not found."
  exit 1
fi

if python -c "import spacy" &> /dev/null; then
  echo "[+] spaCy is installed."
else
  echo "[*] Installing spaCy..."
  pip install spacy
fi

if python -c "import spacy.cli" &> /dev/null; then
  if python -c "import spacy; spacy.load('en_core_web_sm')" &> /dev/null; then
    echo "[+] spaCy English model is installed."
  else
    echo "[*] Downloading spaCy English model..."
    python -m spacy download en_core_web_sm
  fi
else
  echo "[-] Error: spaCy CLI not available."
  exit 1
fi

# Run the main script
echo "[+] Starting Field Distortion Engine..."
python main.py "$@"