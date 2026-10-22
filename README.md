# Links in New Tab

A lightweight Chrome extension that opens every link you click in a new tab, so you never lose your current page.

## Features
- Opens any `http`/`https` link in a new tab, right next to the current one
- Works on all websites, including JavaScript-driven pages and SPAs
- One-click on/off toggle from the toolbar popup
- "OFF" badge on the toolbar icon when disabled
- Preference is remembered and syncs across your Chrome profiles
- No data collection, no analytics, no network requests

## Install

### From the Chrome Web Store
_Link coming soon._

### Manually (developer mode)
1. Download or clone this repository.
2. Open `chrome://extensions`.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the project folder.

## Usage
- Click the extension icon in the toolbar to open the popup.
- Use the switch to enable or disable the extension.
- When enabled, left-clicking a link opens it in a new tab.

## What it leaves alone
- Ctrl/Cmd/Shift/Alt + click and middle-click (Chrome already handles these)
- `mailto:`, `tel:` and `javascript:` links
- In-page `#anchor` links
- Download links
- Links already set to `target="_blank"`

## Known limitation
Navigation triggered purely by JavaScript (for example `window.location = ...` from a button that isn't an `<a>` link) isn't intercepted.

## Project structure
```
├── manifest.json     # Manifest V3 config
├── content.js        # Detects link clicks on pages
├── background.js     # Opens the new tab, updates the toolbar badge
├── popup.html        # Toggle UI
├── popup.js          # Toggle logic, saves preference
├── icons/            # 16, 48, 128 px icons
└── PRIVACY.md        # Privacy policy
```

## Permissions
| Permission | Why |
|---|---|
| `storage` | Saves your on/off preference |
| Content script on all URLs | Detects link clicks on any site; reads only the clicked link's URL |

## Privacy
This extension collects no data. See [PRIVACY.md](PRIVACY.md).

## License
MIT
