# Dokumentation for istandsættelse

Statisk dokumentationsside med før- og efterbilleder, udført arbejde, indkøb og kvitteringer.
Ingen backend, ingen tracking, ingen cookies. Siden er markeret `noindex,nofollow`.

## Kom i gang

```bash
npm install
npm run dev
```

## Byg og udgiv

```bash
npm run build     # kontrollerer data, typetjekker og bygger til dist/
```

`dist/` kan lægges direkte op på Vercel eller Netlify. Begge genkender projektet som Vite:

- **Vercel:** build-kommando `npm run build`, output `dist`
- **Netlify:** build-kommando `npm run build`, publish `dist`

## Billeder

`originals/` indeholder de uændrede originalbilleder og indgår ikke i den udgivne side.
`npm run images` skalerer dem til to web-størrelser i `public/assets/` og måler samtidig
hvert billedes mål til `src/data/image-frames.json`.

Billederne bliver kun skaleret. Der sker ingen beskæring af filerne, ingen retouchering og
ingen farvejustering. Flere billeder er skærmbilleder med sorte bjælker over og under motivet;
de bjælker skjules i visningen ved hjælp af de målte mål, mens filen selv er uændret og kan
åbnes i fuld størrelse fra lightboxen.

Kør `npm run images` igen, hvis der kommer nye billeder i `originals/`.

## Data

Al tekst, alle beløb og alle billedoplysninger ligger i `src/data/`:

| Fil | Indhold |
| --- | --- |
| `copy.ts` | Alle tekster på siden |
| `rooms.ts` | Rum, før-punkter, udført arbejde og resultat |
| `images.ts` | Billeder med rum, fase og billedtekst |
| `receipts.ts` | Kvitteringer og varelinjer med status |
| `calculations.ts` | Beregning af alle beløb |

Beløb udregnes altid fra varelinjerne. Ingen sum er skrevet i hånden i brugerfladen.
`calculations.ts` stopper med en fejl, hvis en kvitterings varelinjer ikke summer til
kvitteringens total, eller hvis de samlede tal ikke rammer kontrolsummerne:

- Samlet dokumenteret: 2.895,05 kr.
- Åbenlyst ikke medtaget: 661,35 kr.
- Foreløbigt bolig-/istandsættelsesrelateret: 2.233,70 kr.

En vare kan være knyttet til flere rum uden at beløbet tælles med mere end én gang.

`npm run check` kører begge kontroller: at alle billeder findes, og at beløbene stemmer.
