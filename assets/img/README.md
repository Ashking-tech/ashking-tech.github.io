# Drop generated Nothing-style assets here

See the prompt kit in the chat. Expected filenames (webp/png/jpg all fine —
keep the name; if you use png/jpg, also update the matching `src` in
index.html or rename the file):

| File | Used for | Aspect |
| --- | --- | --- |
| `portrait.png` | dot-matrix portrait, about section (transparent bg) | 1:1 |
| `og-card.webp` | social share card (then uncomment og:image in index.html) | 1200x630 |

The portrait slot is wired: dropping a file here makes it appear on the site
automatically.

## Retired slots

These were used by earlier versions of the page and are no longer referenced.
The files may still be sitting on disk locally, but nothing loads them:

- `hero-module.webp` — a hero product shot, removed with the hero media rail
- `song-cover.jpg` — album art for a hero "now playing" unit, since removed
- `../audio/song.mp3` — the same unit's audio, ~10 MB, safe to delete

