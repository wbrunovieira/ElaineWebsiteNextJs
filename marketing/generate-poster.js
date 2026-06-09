/*
 * Reception poster generator for Elaine Vieira.
 *
 * Produces a self-contained, print-ready HTML poster (images + QR embedded as
 * base64) using Elaine's brand identity. Open the output in a browser and
 * "print to PDF" or screenshot at 1600x2263 (~193 DPI on A4) for printing.
 *
 * Usage (from the repo root):
 *   node marketing/generate-poster.js
 *   open marketing/reception-poster.html
 *
 * The QR points to CARD_URL — keep it in sync with the live card subdomain.
 */
const fs = require('fs');
const path = require('path');
const QR = require('qrcode'); // devDependency

const ROOT = path.join(__dirname, '..');
const CARD_URL = 'https://card.elainevieira-us.com/';
const OUT = path.join(__dirname, 'reception-poster.html');

const b64 = (p) => fs.readFileSync(path.join(ROOT, p)).toString('base64');
const logoB64 = b64('public/images/elaine-logo-new-nobackground.webp');
const snakeB64 = b64('public/images/snake-marcadagua.webp');

QR.toDataURL(
  CARD_URL,
  { width: 1000, margin: 1, errorCorrectionLevel: 'H', color: { dark: '#E63946', light: '#F5EDE1' } },
  (err, qr) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,500&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Lato', sans-serif; color: #2B2D42; }
  .poster {
    position: relative; width: 1600px; height: 2263px; overflow: hidden;
    background: #F5EDE1; padding: 96px 120px;
  }
  .snake { position: absolute; inset: 0; background: url('data:image/webp;base64,${snakeB64}') no-repeat center;
    background-size: 120%; opacity: 0.06; pointer-events: none; }
  .topbar { position: absolute; top: 0; left: 0; right: 0; height: 26px;
    background: linear-gradient(90deg, #E63946, #D90429); }
  .botbar { position: absolute; bottom: 0; left: 0; right: 0; height: 26px;
    background: linear-gradient(90deg, #D90429, #E63946); }
  .content { position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column;
    align-items: center; justify-content: space-between; text-align: center; }
  .logo { width: 320px; height: 320px; border-radius: 50%; object-fit: contain;
    background: #F5EDE1; border: 7px solid #E63946; box-shadow: 0 18px 40px rgba(230,57,70,0.22); padding: 10px; }
  .name { font-family: 'Playfair Display', serif; font-weight: 900; font-size: 120px; line-height: 1; color: #2B2D42; }
  .role { font-family: 'Playfair Display', serif; font-style: italic; font-weight: 500;
    font-size: 54px; color: #1D6D45; margin-top: 18px; }
  .qrbox { background: #F5EDE1; border: 6px solid #E63946; border-radius: 44px; padding: 44px;
    box-shadow: 0 22px 50px rgba(43,45,66,0.16); }
  .qrbox img { display: block; width: 720px; height: 720px; }
  .scan { font-family: 'Playfair Display', serif; font-size: 66px; font-weight: 700; color: #2B2D42; }
  .scan b { color: #E63946; }
  .hint { margin-top: 18px; font-size: 38px; font-weight: 300; letter-spacing: 3px;
    text-transform: uppercase; color: #8D99AE; }
  .grp { display: flex; flex-direction: column; align-items: center; }
</style>
</head>
<body>
  <div class="poster">
    <div class="snake"></div>
    <div class="topbar"></div>
    <div class="botbar"></div>
    <div class="content">
      <div class="grp">
        <img class="logo" src="data:image/webp;base64,${logoB64}" alt="Elaine Vieira">
        <div class="name" style="margin-top:40px;">Elaine Vieira</div>
        <div class="role">Kundalini Activation &amp; Energy Healing</div>
      </div>
      <div class="qrbox"><img src="${qr}" alt="Elaine Vieira contact QR code"></div>
      <div class="grp">
        <div class="scan">Scan for <b>Elaine&rsquo;s contact</b></div>
        <div class="hint">Point your phone camera here</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    fs.writeFileSync(OUT, html);
    console.log('Poster written to', OUT);
  }
);
