# Plan: Definitively Fix Dai Artes Logo across Environments

Stabilize the logo by moving it to static assets, creating a unified component, and ensuring compatibility with production (Vercel) and PDF generation.

## Proposed Changes

### Assets & Infrastructure
- [x] Create `public/images/` directory.
- [x] Download the official logo from the current asset URL and save it as `public/images/logo-dai-artes.png`.
- [ ] Create a reusable `DaiArtesLogo` component in `src/components/DaiArtesLogo.tsx`.
- [ ] Implement a utility to provide the logo as a Base64 string for PDF generation.

### UI Updates (Unified Component)
- [ ] Replace all direct logo image references with `<DaiArtesLogo />`:
    - `src/routes/auth.tsx` (Login)
    - `src/routes/_authenticated/route.tsx` (Sidebar/Navbar)
    - `src/routes/_authenticated/settings.tsx` (Settings Preview)
    - `src/routes/_authenticated/budgets.$id.tsx` (PDF Preview/Header)

### PDF Stabilization
- [ ] Modify `src/routes/_authenticated/budgets.$id.tsx` to use a reliable image source for `html2pdf.js`.
- [ ] Ensure the logo in the PDF header uses the static asset path or Base64 data URI to avoid 404s in production.

### Verification & Cleanup
- [ ] Search and remove all imports of the old `.asset.json` file.
- [ ] Verify the build process includes the `public/images/logo-dai-artes.png` file.
- [ ] Update `src/routes/index.tsx` to remove the temporary error message instructions.

## Technical Details

- **Asset Path**: `/images/logo-dai-artes.png` (Static, will be served from root in production).
- **Base64 Utility**: A helper function to fetch and convert the image to Base64 to ensure it renders in `html2pdf.js` without cross-origin or 404 issues in production.
- **Component**: `DaiArtesLogo` will support props for sizing and custom className, defaulting to the standard visual identity.
