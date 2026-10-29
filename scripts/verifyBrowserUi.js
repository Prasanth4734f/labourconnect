import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\8707deaf-ffcc-4f3e-b278-4810db8652e4';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class CdpConnection {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = new WebSocket(wsUrl);
    this.msgId = 1;
    this.callbacks = new Map();
    this.eventListeners = new Map();

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const cb = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) cb.reject(new Error(msg.error.message));
        else cb.resolve(msg.result);
      } else if (msg.method && this.eventListeners.has(msg.method)) {
        this.eventListeners.get(msg.method)(msg.params);
      }
    };
  }

  async ready() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
  }

  send(method, params = {}, sessionId = undefined) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.callbacks.set(id, { resolve, reject });
      const payload = { id, method, params };
      if (sessionId) payload.sessionId = sessionId;
      this.ws.send(JSON.stringify(payload));
    });
  }

  on(event, handler) {
    this.eventListeners.set(event, handler);
  }

  close() {
    try { this.ws.close(); } catch {}
  }
}

async function runBrowserVerification() {
  console.log('🚀 Starting Chrome in headless mode with remote debugging...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = 'C:\\Users\\HP\\AppData\\Local\\Temp\\chrome_lc_profile_' + Date.now();
  
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=' + userDataDir,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1600,1000',
    'about:blank'
  ]);

  let isKilled = false;
  const killChrome = () => {
    if (!isKilled) {
      isKilled = true;
      try { chromeProcess.kill(); } catch {}
      try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
    }
  };

  try {
    // Wait for debugging endpoint
    let browserWsUrl = null;
    for (let i = 0; i < 20; i++) {
      await sleep(400);
      try {
        const res = await fetch('http://127.0.0.1:9222/json/version');
        const data = await res.json();
        if (data.webSocketDebuggerUrl) {
          browserWsUrl = data.webSocketDebuggerUrl;
          break;
        }
      } catch (err) {}
    }

    if (!browserWsUrl) {
      throw new Error('Failed to obtain browser WebSocket URL from Chrome');
    }

    console.log('🔗 Connected to Browser DevTools:', browserWsUrl);
    const browserCdp = new CdpConnection(browserWsUrl);
    await browserCdp.ready();

    // Create target for localhost:5173
    const target = await browserCdp.send('Target.createTarget', {
      url: 'http://localhost:5173/'
    });
    console.log('🎯 Created page target:', target.targetId);

    // Attach to page target
    const attached = await browserCdp.send('Target.attachToTarget', {
      targetId: target.targetId,
      flatten: true
    });
    const sessionId = attached.sessionId;
    console.log('⚡ Attached session:', sessionId);

    // Helper to send to page session
    const send = (method, params = {}) => browserCdp.send(method, params, sessionId);

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    console.log('⏳ Waiting 4 seconds for React app to mount...');
    await sleep(4000);

    const titleEval = await send('Runtime.evaluate', { expression: 'document.title' });
    console.log('📄 Document title:', titleEval.result?.value);

    // Check current view or switch to AI House Design Screen
    const checkView = await send('Runtime.evaluate', {
      expression: `(() => {
        // Look for buttons to select AI House Design screen
        const buttons = Array.from(document.querySelectorAll('button'));
        const aiBtn = buttons.find(b => (b.textContent || '').includes('AI Architect') || (b.textContent || '').includes('AI Design') || (b.textContent || '').includes('House Design'));
        if (aiBtn) {
          aiBtn.click();
          return 'Clicked AI screen tab: ' + aiBtn.textContent.trim();
        }
        return 'Already on screen or no tab button needed';
      })()`
    });
    console.log('🧭 View check:', checkView.result?.value);
    await sleep(2000);

    // Input regression prompt using exact element ID
    const regressionPrompt = 'Design a vintage Indian house on a 0.3-acre plot, with 3 bedrooms, 2 floors, 4 bathrooms, a garden, and better vintage furniture.';
    const inputResult = await send('Runtime.evaluate', {
      expression: `(() => {
        const textarea = document.getElementById('prompt-input') || document.querySelector('textarea');
        if (!textarea) return 'No prompt textarea found';
        
        const setVal = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        if (setVal) {
          setVal.call(textarea, ${JSON.stringify(regressionPrompt)});
        } else {
          textarea.value = ${JSON.stringify(regressionPrompt)};
        }
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        return 'Prompt set successfully to: ' + textarea.value.slice(0, 60) + '...';
      })()`
    });
    console.log('✍️ Prompt Input:', inputResult.result?.value);
    await sleep(1500);

    // Step 2: Click Analyse Requirements Button
    const clickAnalyse = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.getElementById('btn-analyse-requirements') || document.querySelector('[data-testid="btn-analyse-requirements"]');
        if (btn) {
          btn.click();
          return 'Clicked #btn-analyse-requirements: ' + btn.textContent.trim();
        }
        return 'Analyse button not found';
      })()`
    });
    console.log('🔍 Analyse Action:', clickAnalyse.result?.value);
    await sleep(2000);

    // Step 3: Click Primary Generate Design Button
    const clickGen = await send('Runtime.evaluate', {
      expression: `(() => {
        const genBtn = document.getElementById('btn-generate-design') || document.querySelector('[data-testid="btn-generate-design"]');
        if (genBtn) {
          genBtn.click();
          return 'Clicked #btn-generate-design: ' + genBtn.textContent.trim();
        }
        return 'Generate button not found';
      })()`
    });
    console.log('⚡ Generate Action:', clickGen.result?.value);

    // Wait for design computation and WebGL 3D rendering
    console.log('⏳ Waiting 6 seconds for 3D model generation & rendering...');
    await sleep(6000);

    // Extract UI metrics to verify against requirements
    const uiMetrics = await send('Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasAcreOrSqft: text.includes('0.3') || text.includes('13,095') || text.includes('13095'),
          has3Bedrooms: text.includes('3 Bed') || text.includes('3 BHK') || text.includes('3BHK'),
          has4Bathrooms: text.includes('4 Bath') || text.includes('4 Toilet'),
          has2Floors: text.includes('2 Floor') || text.includes('Ground') && text.includes('First'),
          hasVintage: text.toLowerCase().includes('vintage'),
          hasCanvas: Boolean(document.querySelector('canvas'))
        };
      })()`
    });
    console.log('📊 UI Verified Metrics:', uiMetrics.result?.value);

    // Capture Screenshot 1: 3D Visualization Viewport
    const ss1 = await send('Page.captureScreenshot', { format: 'png' });
    const img1Path = path.join(ARTIFACT_DIR, 'vintage_indian_house_browser_3d.png');
    fs.writeFileSync(img1Path, Buffer.from(ss1.data, 'base64'));
    console.log('📸 3D Viewport Screenshot saved to:', img1Path);

    // Switch to 5D cutaway / 2D floor plans tab if available, then capture
    await send('Runtime.evaluate', {
      expression: `(() => {
        const tabs = Array.from(document.querySelectorAll('button'));
        const planTab = tabs.find(t => (t.textContent || '').toLowerCase().includes('floor plan') || (t.textContent || '').toLowerCase().includes('2d') || (t.textContent || '').toLowerCase().includes('5d'));
        if (planTab) planTab.click();
        window.scrollBy(0, 500);
      })()`
    });
    await sleep(2000);

    // Capture Screenshot 2: Floor Plans / Cutaways & Technical Takeoff
    const ss2 = await send('Page.captureScreenshot', { format: 'png' });
    const img2Path = path.join(ARTIFACT_DIR, 'vintage_indian_house_browser_details.png');
    fs.writeFileSync(img2Path, Buffer.from(ss2.data, 'base64'));
    console.log('📸 Detailed View Screenshot saved to:', img2Path);

    console.log('🎉 Browser verification completed successfully!');
  } finally {
    killChrome();
  }
}

runBrowserVerification().catch(err => {
  console.error('Browser verification error:', err);
  process.exit(1);
});
