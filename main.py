#!/usr/bin/env python3
"""
Shadow Systems Theory - Field Distortion Engine
Main entry point for the web application.

This script initializes the Flask application for the Shadow OSINT Field Distortion Engine.
"""
from app import app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)