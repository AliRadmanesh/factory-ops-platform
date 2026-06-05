## ADDED Requirements

### Requirement: PWA manifest enables fullscreen standalone install
The system SHALL include a `public/manifest.json` with `"display": "standalone"`, `start_url: "/"`, and icon assets at 192x192 and 512x512 px. The root layout SHALL link to the manifest via `<link rel="manifest">`.

#### Scenario: Manifest linked in root layout
- **WHEN** browser loads any page
- **THEN** the `<link rel="manifest" href="/manifest.json">` tag is present in the `<head>`

#### Scenario: Standalone display hides browser chrome
- **WHEN** PWA is launched from home screen
- **THEN** no browser URL bar or navigation chrome is visible

#### Scenario: Icons present at required sizes
- **WHEN** `public/manifest.json` is fetched
- **THEN** icons array includes entries for 192x192 and 512x512 with valid `src`, `sizes`, and `type` fields

### Requirement: iOS Safari install supported via meta tags
The root layout SHALL include iOS-specific meta tags to enable fullscreen home-screen behaviour: `apple-mobile-web-app-capable` and `apple-mobile-web-app-status-bar-style`. An `apple-touch-icon` link SHALL be present.

#### Scenario: iOS meta tags present
- **WHEN** browser fetches any page
- **THEN** `<meta name="apple-mobile-web-app-capable" content="yes">` and `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">` are in `<head>`

#### Scenario: Apple touch icon resolves
- **WHEN** browser requests `/icons/apple-touch-icon.png`
- **THEN** a valid PNG image is returned (HTTP 200)

### Requirement: Serwist service worker registered
The system SHALL use `serwist` + `@serwist/next` to register a service worker from `sw.ts`. The service worker SHALL be generated to `public/sw.js` by the Next.js build. The service worker SHALL use `skipWaiting: true` and `clientsClaim: true`.

#### Scenario: Service worker registered in browser
- **WHEN** the app loads in a browser supporting service workers
- **THEN** `navigator.serviceWorker.controller` is non-null after the first load

#### Scenario: Service worker file served correctly
- **WHEN** browser requests `/sw.js`
- **THEN** a valid JavaScript service worker file is returned with correct content-type

#### Scenario: Next.js build generates service worker
- **WHEN** `npm run build` completes
- **THEN** `public/sw.js` file exists and is non-empty

### Requirement: PWA installs and runs fullscreen on iOS (Safari) and Android (Chrome)
The system SHALL be installable as a PWA on a real iOS device via Safari "Add to Home Screen" and on a real Android device via Chrome "Add to Home Screen" or install prompt. When launched from the home screen, the app SHALL open fullscreen without browser chrome.

#### Scenario: iOS install and fullscreen launch
- **WHEN** user adds the app to iOS home screen via Safari and launches it
- **THEN** the app opens fullscreen with no Safari URL bar or tab bar visible

#### Scenario: Android install and fullscreen launch
- **WHEN** user adds the app to Android home screen via Chrome and launches it
- **THEN** the app opens fullscreen with no Chrome navigation UI visible

#### Scenario: Cold open performance on PWA
- **WHEN** PWA is launched from home screen (cold start)
- **THEN** the operator selection screen is interactive within 2 seconds
