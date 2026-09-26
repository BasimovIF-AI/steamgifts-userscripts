# Changelog

All notable changes to the userscripts in this repository will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unlucky-7 Winner Stats & Copy - 1.4.1] - 2026-09-27
### Added
- Internationalization support (English & Russian auto-switching for tooltips and console logs).
- GitHub repository links (`@homepageURL`, `@supportURL`) and `@license MIT`.

### Changed
- Standardized file name to `steamgifts-unlucky-7-winner-stats-copy.user.js`.
- Synchronized author namespace with GreasyFork profile (`basimovif-ai`).

---

## [Chance Per Point - 7.0.0] - 2026-09-27
### Added
- Bilingual UI (English / Russian) for filter labels, column headers, and action buttons.
- GreasyFork and GitHub repository metadata tags.

### Changed
- Renamed script file to `steamgifts-chance-per-point.user.js`.
- Cleaned up grid resizing logic to prevent column overflow on varied SteamGifts viewports.

---

## [Group Stats Checker - 1.7.0] - 2026-09-27
### Added
- Bilingual tooltips and UI feedback (`Check my stats`, `Formula`, `Not found`, `Error`).
- GreasyFork and GitHub repository links in metadata.

### Changed
- Renamed script file to `steamgifts-group-stats-checker.user.js`.
- Refined URL path matching to reliably handle both `/giveaway/:code/:slug` and sub-view exclusions.

---

## [Region Auto-Selector - 1.5.0] - 2026-09-27
### Added
- Bilingual interface for SubID input label, buttons, and detailed status/warning messages.
- Cloudflare bypass status guidance for temporary SteamDB tab.

### Changed
- Renamed script file to `steamgifts-region-auto-selector.user.js`.
- Standardized country difference parser between SteamDB and SteamGifts form DOM.
