# Marketing assets

Print materials for Elaine Vieira's Kundalini Activation.

## Reception poster

- `generate-poster.js` — generator for the reception poster (preferred for edits).
- `reception-poster.html` — the rendered, self-contained output (logo, snake and QR embedded as base64).

### Regenerate after edits

```bash
node marketing/generate-poster.js
open marketing/reception-poster.html
```

Then print to PDF, or screenshot at **1600×2263** (≈193 DPI on A4) to get a print-ready PNG.

The QR encodes `https://card.elainevieira-us.com/` — update `CARD_URL` in the generator if the card address changes.
