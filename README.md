# WeightAI colour system

A Next.js App Router colour workspace with seven healthcare palettes and a separate Custom Palette Studio at `/custom`. Includes HEX/RGB switching, clipboard controls, semantic status colours and downloadable CSS custom properties.

The Custom Palette Studio provides a 108-shade spectrum library and a full RGB/HSV mixer, named palettes of up to 32 colours, reordering, individual colour editing, and CSS/JSON exports. The current draft is automatically saved in local browser storage, and Save palette creates a named snapshot (up to 20). Saved snapshots expire seven days after saving; the draft expires seven days after its last browser save. Data is local to the browser and device, not uploaded or synced. Clearing site data removes these temporary saves. Export for a permanent copy. If browser storage is unavailable, editing and exports remain available for the current visit.

Each palette swatch opens a paint-style colour studio: a square saturation/brightness mixer, rainbow hue slider, 32 preset choices, editable HEX and RGB fields, original-colour restore, and live colour preview. Drag within the square or use arrow keys (Shift for larger steps); Escape or Done closes the studio. The inline six-digit HEX editor is also available. Supported browsers on HTTPS or localhost also show a screen eyedropper; Escape cancels sampling. Edits update the palette preview, RGB values, live CSS code, clipboard output, and downloaded CSS tokens. Changes are kept while switching palettes during the current page session; refreshing restores the defaults. Reset palette restores only the selected palette. Invalid HEX input leaves the last valid colour unchanged; Escape restores its current code.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. Run `npm run build` for the static export in `out/` and `npm run typecheck` for TypeScript validation.

Dependencies use the npm stable `latest` dist-tag. Install resolves the versions and creates a lockfile. Google Fonts has a local sans-serif fallback.

## TypeScript configuration

Keep both `.next/types/**/*.ts` and `.next/dev/types/**/*.ts` in `tsconfig.json`. Next.js generates production and development route types separately and may add these paths automatically. The configuration update message is informational.

`npm run typecheck` generates Next.js route types before checking TypeScript, so it also works before the first development run. Let Next.js manage `next-env.d.ts`.

## Vercel deployment

Import `ShabeehaSarook/color-Platte` in Vercel and use the repository root as the Root Directory. The committed `vercel.json` sets the Next.js framework, `npm ci --no-audit --no-fund` install command, `npm run build` build command, and `npm run dev` development command. Installation uses the committed lockfile and skips audit and funding requests during deployment. `outputDirectory: null` explicitly selects automatic framework output detection, so the Next.js adapter can read its `.next` manifests. Leave the dashboard Output Directory override disabled as well. Select Node.js 24.x in the project settings. This palette library requires no environment variables.

The app uses `output: 'export'` in `next.config.ts`. Next.js writes its framework manifests to `.next` and the exported site to `out`. Vercel's Next.js adapter reads the manifests and handles the static export automatically; do not set its Output Directory to `out` or copy manifests there. Netlify continues to publish `out` using `netlify.toml`. Palette selection, clipboard actions, and CSS downloads run in the browser. No server functions or catch-all rewrites are needed.

If a previous Vercel deployment failed with `out/routes-manifest.json` missing, disable the Output Directory override in Project Settings → Build and Deployment, then redeploy the updated commit with the previous build cache disabled.

Once the repository is connected in Vercel, pushes to its configured production branch deploy automatically; other branches receive preview deployments. Local Vercel account links and build artifacts are excluded from uploads and Git.
