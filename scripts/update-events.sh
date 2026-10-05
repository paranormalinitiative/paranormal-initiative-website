#!/bin/bash
# TPI Event Update Script
# Run this script periodically to fetch new events

echo "=========================================="
echo "TPI Event Updater"
echo "=========================================="
echo ""
echo "Fetching latest paranormal events..."
echo ""

cd /Users/toddknipple/Desktop/paranormal-initiative-website

# Run the scraper
python3 scripts/scrape-events.py

echo ""
echo "=========================================="
echo "Events updated! Open events.html to view."
echo "=========================================="
