const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = path.resolve('C:/Users/HP/.gemini/antigravity/brain/8707deaf-ffcc-4f3e-b278-4810db8652e4');
const TEMP_PROFILE = path.join(ARTIFACT_DIR, 'chrome_sprint5_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.callbacks = new Map();
  }

  async connect() {
    this.ws = new globalThis.WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && this.callbacks.has(data.id)) {
        const { resolve, reject } = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return res.result?.value;
  }

  async captureScreenshot(outputPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(outputPath, buffer);
    console.log(`Saved screenshot: ${path.basename(outputPath)} (${buffer.length} bytes)`);
    return buffer.length;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function hideInstallBanner(client) {
  await client.evaluate(`
    (() => {
      const dismissBtn = document.querySelector('button[aria-label="Dismiss"]');
      if (dismissBtn) dismissBtn.click();
    })()
  `);
}

async function generateDesign(client, promptText) {
  console.log(`Setting prompt: "${promptText.substring(0, 50)}..."`);
  await client.evaluate(`
    (() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        nativeSetter.call(textarea, ${JSON.stringify(promptText)});
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()
  `);
  await sleep(800);

  // Click Analyse Requirements
  await client.evaluate(`
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => 
        b.textContent && (b.textContent.includes('Analyse Requirements') || b.textContent.includes('Validate'))
      );
      if (btn) btn.click();
    })()
  `);
  await sleep(1500);

  // Click Generate Design
  await client.evaluate(`
    (() => {
      const genBtn = document.getElementById('btn-generate-design') ||
                     Array.from(document.querySelectorAll('button')).find(b => 
                       b.textContent && (b.textContent.includes('Generate Design') || b.textContent.includes('Generate Sample'))
                     );
      if (genBtn) genBtn.click();
    })()
  `);
  await sleep(8000);

  // Switch to 3D Design tab
  await client.evaluate(`
    (() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn3d = buttons.find(b => b.textContent && b.textContent.includes('3D Design'));
      if (btn3d) btn3d.click();
    })()
  `);
  await sleep(3500);
  await hideInstallBanner(client);
}

async function main() {
  console.log('1. Launching Chrome headless (1600x1000)...');
  const chromeProc = spawn(CHROME_PATH, [
    '--remote-debugging-port=9222',
    '--headless=new',
    '--window-size=1600,1000',
    `--user-data-dir=${TEMP_PROFILE}`,
    'about:blank'
  ], { detached: false });

  let connected = false;
  let targets = null;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      targets = await fetchJson('http://127.0.0.1:9222/json/list');
      if (targets && targets.length > 0) {
        connected = true;
        break;
      }
    } catch (e) {}
  }

  if (!connected || !targets) {
    console.error('Failed to connect to Chrome CDP.');
    chromeProc.kill();
    process.exit(1);
  }

  const target = targets.find(t => t.type === 'page') || targets[0];
  const client = new CDPClient(target.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('DOM.enable');
  await client.send('Runtime.enable');

  console.log('2. Navigating to http://localhost:5173...');
  await client.send('Page.navigate', { url: 'http://localhost:5173' });
  await sleep(3000);

  console.log('3. Navigating to AI Design Studio...');
  await client.evaluate(`
    (() => {
      const items = Array.from(document.querySelectorAll('button, a, nav *'));
      const studioBtn = items.find(el => el.textContent && el.textContent.includes('AI Design Studio'));
      if (studioBtn) studioBtn.click();
    })()
  `);
  await sleep(2500);

  const captureLog = [];

  // =========================================================================
  // SECTION 3: SPECIFIC VINTAGE INDIAN HOUSE ON 0.3-ACRE PLOT
  // =========================================================================
  console.log('\n--- PHASE A: VINTAGE INDIAN HOUSE (0.3-ACRE PLOT) ---');
  const vintagePrompt = "Design a vintage Indian house on a 0.3-acre plot, with 3 bedrooms, 2 floors, 4 bathrooms, a garden, and traditional vintage furniture.";
  await generateDesign(client, vintagePrompt);

  // 1. Exterior 3D View
  console.log('Capturing: vintage_03acre_exterior_3d.png...');
  await client.evaluate(`
    (() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const extBtn = buttons.find(b => b.textContent && b.textContent.includes('Complete Home'));
      if (extBtn) extBtn.click();
    })()
  `);
  await sleep(2500);
  const shotA1 = path.join(ARTIFACT_DIR, 'vintage_03acre_exterior_3d.png');
  const sizeA1 = await client.captureScreenshot(shotA1);
  captureLog.push({ file: 'vintage_03acre_exterior_3d.png', size: sizeA1, label: 'Vintage 0.3-Acre Exterior (Clay Tile Roof & Garden)' });

  // 2. Ground Floor Cutaway View
  console.log('Capturing: vintage_03acre_ground_floor_cutaway.png...');
  await client.evaluate(`
    (() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const gfBtn = buttons.find(b => b.textContent && b.textContent.includes('Ground Floor'));
      if (gfBtn) gfBtn.click();
      const cutBtn = buttons.find(b => b.textContent && b.textContent.includes('Cutaway'));
      if (cutBtn) cutBtn.click();
    })()
  `);
  await sleep(2500);
  const shotA2 = path.join(ARTIFACT_DIR, 'vintage_03acre_ground_floor_cutaway.png');
  const sizeA2 = await client.captureScreenshot(shotA2);
  captureLog.push({ file: 'vintage_03acre_ground_floor_cutaway.png', size: sizeA2, label: 'Vintage 0.3-Acre Ground Floor Cutaway (Furniture & Layout)' });

  // 3. First Floor Cutaway View
  console.log('Capturing: vintage_03acre_first_floor_cutaway.png...');
  await client.evaluate(`
    (() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const f1Btn = buttons.find(b => b.textContent && (b.textContent.includes('1st Floor') || b.textContent.includes('Floor 1')));
      if (f1Btn) f1Btn.click();
    })()
  `);
  await sleep(2500);
  const shotA3 = path.join(ARTIFACT_DIR, 'vintage_03acre_first_floor_cutaway.png');
  const sizeA3 = await client.captureScreenshot(shotA3);
  captureLog.push({ file: 'vintage_03acre_first_floor_cutaway.png', size: sizeA3, label: 'Vintage 0.3-Acre 1st Floor Cutaway (Suites & Baths)' });

  // 4. Top-Down Plan View
  console.log('Capturing: vintage_03acre_topdown_plan.png...');
  await client.evaluate(`
    (() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const topBtn = buttons.find(b => b.textContent && b.textContent.includes('Top Plan'));
      if (topBtn) topBtn.click();
    })()
  `);
  await sleep(2500);
  const shotA4 = path.join(ARTIFACT_DIR, 'vintage_03acre_topdown_plan.png');
  const sizeA4 = await client.captureScreenshot(shotA4);
  captureLog.push({ file: 'vintage_03acre_topdown_plan.png', size: sizeA4, label: 'Vintage 0.3-Acre Top-Down Cutaway Plan' });

  // =========================================================================
  // SECTION 4: ARCHITECTURAL IDENTITIES VALIDATION
  // =========================================================================
  console.log('\n--- PHASE B: ARCHITECTURAL IDENTITIES VALIDATION ---');

  // Style 1: Modern Duplex
  console.log('1. Testing Modern Contemporary Duplex...');
  const modernPrompt = "Design a modern contemporary 3BHK duplex on 30x40 plot with flat roof, glass balcony, and open kitchen";
  await generateDesign(client, modernPrompt);
  await client.evaluate(`
    (() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const extBtn = buttons.find(b => b.textContent && b.textContent.includes('Complete Home'));
      if (extBtn) extBtn.click();
    })()
  `);
  await sleep(2500);
  const shotB1 = path.join(ARTIFACT_DIR, 'style_modern_duplex.png');
  const sizeB1 = await client.captureScreenshot(shotB1);
  captureLog.push({ file: 'style_modern_duplex.png', size: sizeB1, label: 'Modern Contemporary Duplex (Flat Roof, Glass Balcony)' });

  // Style 2: Luxury Villa
  console.log('2. Testing Luxury Architectural Villa...');
  const luxuryPrompt = "Create a luxury high-end 4BHK architectural villa on 50x60 plot with double-height ceiling, home office, and terrace lounge";
  await generateDesign(client, luxuryPrompt);
  await client.evaluate(`
    (() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const extBtn = buttons.find(b => b.textContent && b.textContent.includes('Complete Home'));
      if (extBtn) extBtn.click();
    })()
  `);
  await sleep(2500);
  const shotB2 = path.join(ARTIFACT_DIR, 'style_luxury_villa.png');
  const sizeB2 = await client.captureScreenshot(shotB2);
  captureLog.push({ file: 'style_luxury_villa.png', size: sizeB2, label: 'Luxury Architectural Villa (Double-Height, Travertine Facade)' });

  // Style 3: Traditional Courtyard House
  console.log('3. Testing Traditional Kerala Courtyard House...');
  const courtyardPrompt = "Build a traditional Kerala courtyard house on 40x50 plot with central nadumuttam courtyard, timber pillars, and sloping roof";
  await generateDesign(client, courtyardPrompt);
  await client.evaluate(`
    (() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const extBtn = buttons.find(b => b.textContent && b.textContent.includes('Complete Home'));
      if (extBtn) extBtn.click();
    })()
  `);
  await sleep(2500);
  const shotB3 = path.join(ARTIFACT_DIR, 'style_traditional_courtyard.png');
  const sizeB3 = await client.captureScreenshot(shotB3);
  captureLog.push({ file: 'style_traditional_courtyard.png', size: sizeB3, label: 'Traditional Kerala Courtyard House (Nadumuttam, Clay Tiles)' });

  // Style 4: Penthouse with Sky Terrace
  console.log('4. Testing Penthouse with Sky Terrace...');
  const penthousePrompt = "Design a modern luxury penthouse on 40x60 plot with panoramic sky terrace, pergola garden, and open layout";
  await generateDesign(client, penthousePrompt);
  await client.evaluate(`
    (() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const extBtn = buttons.find(b => b.textContent && b.textContent.includes('Complete Home'));
      if (extBtn) extBtn.click();
    })()
  `);
  await sleep(2500);
  const shotB4 = path.join(ARTIFACT_DIR, 'style_penthouse_terrace.png');
  const sizeB4 = await client.captureScreenshot(shotB4);
  captureLog.push({ file: 'style_penthouse_terrace.png', size: sizeB4, label: 'Luxury Penthouse (Pergola Sky Terrace Garden)' });

  console.log('\n======================================================');
  console.log('Visual Validation Complete! Summary:');
  captureLog.forEach(l => console.log(`  - ${l.file}: ${l.size} bytes (${l.label})`));
  console.log('======================================================');

  client.close();
  chromeProc.kill();
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal visual validation error:', err);
  process.exit(1);
});
