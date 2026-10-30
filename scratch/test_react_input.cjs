const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/HP/.gemini/antigravity/brain/8707deaf-ffcc-4f3e-b278-4810db8652e4';
const TEMP_PROFILE = path.join(ARTIFACT_DIR, 'chrome_test_profile3');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const chromeProc = spawn(CHROME_PATH, [
    '--remote-debugging-port=9225',
    '--headless=new',
    '--window-size=1600,1000',
    `--user-data-dir=${TEMP_PROFILE}`,
    'http://localhost:5173'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  http.get('http://127.0.0.1:9225/json/list', res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', async () => {
      const targets = JSON.parse(body);
      const ws = new globalThis.WebSocket(targets[0].webSocketDebuggerUrl);
      ws.onopen = async () => {
        let msgId = 1;
        function send(method, params = {}) {
          return new Promise(res => {
            const id = msgId++;
            const h = (e) => {
              const d = JSON.parse(e.data);
              if (d.id === id) { ws.removeEventListener('message', h); res(d.result); }
            };
            ws.addEventListener('message', h);
            ws.send(JSON.stringify({ id, method, params }));
          });
        }
        await send('Runtime.enable');
        await send('Page.enable');
        await new Promise(r => setTimeout(r, 3500));

        // Navigate to studio
        await send('Runtime.evaluate', { 
          expression: `(() => { 
            const b = Array.from(document.querySelectorAll('button, a')).find(el => el.textContent && el.textContent.includes('AI Design Studio'));
            if (b) b.click();
          })()`
        });
        await new Promise(r => setTimeout(r, 3000));

        // Use nativeInputValueSetter
        const prompt = "Design a vintage Indian house on a 0.3-acre plot, with 3 bedrooms, 2 floors, 4 bathrooms, a garden, and traditional vintage furniture.";
        const evalRes = await send('Runtime.evaluate', {
          expression: `(() => {
            const ta = document.querySelector('textarea');
            if (!ta) return 'NO_TEXTAREA';
            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
            nativeSetter.call(ta, ${JSON.stringify(prompt)});
            ta.dispatchEvent(new Event('input', { bubbles: true }));
            ta.dispatchEvent(new Event('change', { bubbles: true }));
            return ta.value;
          })()`,
          returnByValue: true
        });
        console.log('Textarea updated value:', evalRes.result?.value);

        // Click Analyse Requirements
        await new Promise(r => setTimeout(r, 600));
        await send('Runtime.evaluate', {
          expression: `(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Analyse Requirements'));
            if (btn) btn.click();
            return Boolean(btn);
          })()`,
          returnByValue: true
        });

        await new Promise(r => setTimeout(r, 1200));

        // Check if specs were confirmed and what values are displayed in the form
        const specsText = await send('Runtime.evaluate', {
          expression: `(() => {
            const confirmed = document.querySelector('div[style*=\"SPECIFICATIONS CONFIRMED\"]') || 
                              Array.from(document.querySelectorAll('div')).find(d => d.textContent && d.textContent.includes('SPECIFICATIONS CONFIRMED'));
            if (!confirmed) return 'NOT_CONFIRMED';
            return Array.from(confirmed.querySelectorAll('div')).map(d => d.textContent.trim()).filter(Boolean);
          })()`,
          returnByValue: true
        });
        console.log('Confirmed specs on screen:', specsText.result?.value);

        ws.close();
        chromeProc.kill();
        process.exit(0);
      };
    });
  });
}
main();
