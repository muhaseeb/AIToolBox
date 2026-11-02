# Full Page Screenshot (Chrome Extension)

Ek click mein **poore page ka full-length screenshot** le leta hai — jaise "GoFullPage"
karti thi, par ekdam free aur local. Extension icon par click karo, ye khud page ko
upar se neeche tak scroll karega, har viewport ka screenshot lekर ek lambi image mein
jod dega, aur PNG download kar dega.

## Kaam kaise karta hai

1. Toolbar par extension icon click karo.
2. Page apne aap top se bottom tak scroll hota hai.
3. Har screen ka capture hota hai (device pixel ratio ke hisaab se — retina par bhi sharp).
4. Saare tiles ek `<canvas>` par stitch ho jaate hain.
5. `fullpage_<site>_<date>.png` naam se screenshot download ho jaata hai.

Scroll ke dauraan upar-right corner mein ek chhota progress bar dikhta hai (`Capturing… 3/8`).
Fixed/sticky headers har tile mein repeat na hon, iske liye capture ke waqt unhe hide kar
diya jaata hai (pehle tile ko chhodkar).

## Install kaise karein (Developer mode)

Ye extension abhi Chrome Web Store par nahi hai, to "unpacked" load karni hai:

1. Chrome kholo aur address bar mein jao: `chrome://extensions`
2. Upar-right mein **Developer mode** toggle ON karo.
3. **Load unpacked** button dabao.
4. Ye folder select karo: `extensions/fullpage-screenshot`
5. Bas! Toolbar mein neela camera icon aa jayega. Puzzle-piece icon se usse pin kar lo.

Ab jis bhi page ka full screenshot chahiye, waha jao aur icon par click kar do.

## Permissions (aur kyun chahiye)

| Permission    | Kyun |
|---------------|------|
| `activeTab`   | Sirf jis tab par click karo usi ka screenshot (`captureVisibleTab`) lene ke liye. |
| `scripting`   | Us page mein scroll + stitch wala script inject karne ke liye. |

Koi data kahin bheja nahi jaata — sab kuch aapke browser ke andar hi hota hai. Screenshot
seedhe aapke computer par download hota hai.

## Limitations (seedhi baat)

- **`chrome://`, Web Store, aur extension pages** par kaam nahi karta — Chrome in par kisi
  bhi extension ko capture nahi karne deta. Aise page par click karne par icon par laal `x`
  dikhega.
- **Bahut-bahut lambe pages** (karib 32,767 px se zyada tall) browser ki canvas height limit
  par clamp ho jaate hain — niche ka thoda hissa cut ho sakta hai.
- **Lazy-load content / infinite scroll**: capture har step par ~180ms rukta hai taki content
  load ho jaye, par bahut heavy lazy pages par kuch hissa miss ho sakta hai.
- Chrome `captureVisibleTab` ko rate-limit karta hai, isliye lambe page par capture mein
  thoda time lagta hai (har screen ke beech choti si gap). Ye normal hai.
- Abhi sirf **vertical** full-page capture hai (horizontal scroll ignore hota hai) — jo 99%
  cases cover karta hai.

## Files

```
extensions/fullpage-screenshot/
├── manifest.json      # MV3 config, permissions, icons
├── background.js      # service worker: toolbar click + captureVisibleTab (rate-limited)
├── content.js         # scroll + capture tiles + stitch on canvas + download
├── icons/             # 16 / 48 / 128 px icons
└── README.md
```
