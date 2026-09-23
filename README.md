# nature palette

Upload a photo from nature, extract its 3 most prominent colors, and build a library of the palettes you've found. Color extraction runs entirely in the browser via canvas — images never leave your device.

## Setup

```bash
npm install
npm run dev
```

No API keys or accounts needed — everything, including the species naming below, runs client-side.

### AI species naming

Library cards show a species/subject name guessed by [MobileNet](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet) via TensorFlow.js, running entirely in the browser. It's free and unlimited — no API key, no server, no cost — but it's a general-purpose ImageNet classifier, not a dedicated plant/animal identifier, so:

- it does best on common, clearly-photographed subjects
- it can be vague or off on close-ups, unusual angles, or less common species
- low-confidence guesses are dropped rather than shown, so a card sometimes shows "untitled" instead of a shaky label

The model (~10-16 MB) downloads lazily the first time you extract a palette, and is cached by the browser afterward. You can always rename a card yourself from its detail view, whether or not the AI got it right.

## Stack

Vite + React + TypeScript, fully static (no backend). Palette metadata and photo thumbnails are stored in the browser's IndexedDB (via `idb-keyval`) — the library is per-browser and has no account system.
