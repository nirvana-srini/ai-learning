# AI Text Explainer Chrome Extension

This Chrome extension provides AI-powered explanations for selected text using a local ML service.

## Features

- Right-click context menu to explain selected text
- Double-click text to get instant explanations
- Smart context gathering from surrounding text
- Clean tooltip and side panel UI
- Topic detection from page title/headings

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select this extension directory

## Usage

1. Select any text on a webpage
2. Either:
   - Double-click the selection for instant explanation
   - Right-click and select "Explain this text"
3. View the explanation in the side panel

## Requirements

- Local ML service running on port 5001
- Spring Boot backend running on port 8080

## Development

The extension consists of:
- `manifest.json`: Extension configuration
- `background.js`: Handles context menu and API calls
- `content-script.js`: Manages UI and text selection
- `styles.css`: UI styling

## Note

Before using the extension, make sure both the ML service and Spring Boot backend are running:
1. ML service: `source venv/bin/activate && python app.py`
2. Spring Boot: `./mvnw spring-boot:run`
