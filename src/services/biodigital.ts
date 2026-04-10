/**
 * BioDigital Human 3D anatomy integration.
 *
 * Setup instructions:
 * 1. Create account at https://developer.biodigital.com
 * 2. Register your application to get an API key
 * 3. Replace BIODIGITAL_API_KEY below with your key
 *
 * The integration uses their WebView-based JS widget.
 * Falls back gracefully to 2D SVG when not configured.
 */

import { Platform } from 'react-native';

// ⚠️ Replace with your actual BioDigital API key
const BIODIGITAL_API_KEY = 'YOUR_BIODIGITAL_API_KEY';

const BIODIGITAL_BASE_URL = 'https://human.biodigital.com/widget';

let isConfigured = false;

/**
 * Initialize BioDigital service. Call once at app startup.
 */
export function initBioDigital(): void {
  if (isConfigured || !BIODIGITAL_API_KEY || BIODIGITAL_API_KEY.startsWith('YOUR_')) {
    if (__DEV__) {
      console.log('[BioDigital] Skipping init — no API key configured. Using 2D fallback.');
    }
    return;
  }

  isConfigured = true;

  if (__DEV__) {
    console.log('[BioDigital] Configured successfully');
  }
}

/**
 * Check if BioDigital is properly configured.
 */
export function isBioDigitalConfigured(): boolean {
  return isConfigured;
}

/**
 * Build a BioDigital Human widget URL with highlighted anatomy.
 * Returns null if not configured.
 */
export function getBioDigitalModelUrl(muscleNames: string[]): string | null {
  if (!isConfigured) return null;

  const params = new URLSearchParams({
    key: BIODIGITAL_API_KEY,
    ui: 'false',
    'ui-tools': 'false',
    'ui-info': 'false',
    'ui-zoom': 'true',
    'ui-pan': 'true',
    'ui-fullscreen': 'false',
    background: '0D0D1AFF',
  });

  if (muscleNames.length > 0) {
    params.set('highlight', muscleNames.join(','));
  }

  return `${BIODIGITAL_BASE_URL}?${params.toString()}`;
}

/**
 * Get the injectable JavaScript for BioDigital WebView communication.
 * This script bridges the WebView with React Native via postMessage.
 */
export function getBioDigitalInjectedJS(): string {
  return `
    (function() {
      // Listen for anatomy selection events from BioDigital widget
      if (window.HumanAPI) {
        window.HumanAPI.on('scene.picked', function(event) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'anatomySelected',
            objectId: event.objectId,
            name: event.name
          }));
        });
      }

      // Expose highlight function for React Native to call
      window.highlightMuscles = function(muscleNames) {
        if (window.HumanAPI) {
          window.HumanAPI.send('scene.highlight', { objects: muscleNames });
        }
      };

      true;
    })();
  `;
}

/**
 * Get a demo/fallback HTML for when BioDigital is not configured.
 * Shows a placeholder 3D-like visualization.
 */
export function getDemoHtml(): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          background: #0D0D1A;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-family: -apple-system, sans-serif;
          color: #E8E0F0;
          text-align: center;
        }
        .container { padding: 24px; }
        .icon { font-size: 64px; margin-bottom: 16px; }
        .title { font-size: 18px; color: #9B6DFF; font-weight: 700; margin-bottom: 8px; }
        .desc { font-size: 14px; color: #A89BC0; line-height: 1.5; }
        .badge {
          display: inline-block;
          margin-top: 16px;
          padding: 8px 16px;
          background: #9B6DFF20;
          border: 1px solid #9B6DFF;
          border-radius: 8px;
          color: #9B6DFF;
          font-size: 12px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">🦴</div>
        <div class="title">3D Anatomy Viewer</div>
        <div class="desc">
          ${__DEV__ ? 'Configure your BioDigital API key<br>to enable 3D visualization.' : 'Connect to view interactive 3D anatomy models.'}
        </div>
        <div class="badge">BioDigital Human</div>
      </div>
    </body>
    </html>
  `;
}
