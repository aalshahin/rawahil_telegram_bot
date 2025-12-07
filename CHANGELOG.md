# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup
- Telegram bot integration
- Prayer times functionality
- Quran verse browsing
- Hadith collections access
- Islamic lectures feature
- Admin panel for bot management
- Scheduled prayer notifications
- Navigation handlers for bot commands

### Changed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- N/A

## [1.0.0] - 2025-12-04

### Added
- Initial release of Rawahil Telegram bot
- Core bot functionality with node-telegram-bot-api
- TypeScript support with ES Modules
- Environment configuration with dotenv
- Prayer times service
- Quran service
- Hadith service with API integration
- Lectures service
- Admin service for bot management
- File utilities for data management
- Message utilities for bot responses
- State management for user sessions
- Automated scheduling with node-schedule
- Luxon for date/time handling

### Technical
- Node.js with ES Modules support
- TypeScript 5.9.3
- ts-node for development
- Comprehensive dependency management
- Modular architecture with services and handlers

---

## Release Notes Format

Each release should include:

### Added
- New features and capabilities

### Changed
- Changes to existing functionality

### Deprecated
- Features that will be removed in future releases

### Removed
- Features that have been removed

### Fixed
- Bug fixes and corrections

### Security
- Security-related changes and fixes

---

## Version History

- **[Unreleased]** - Current development version
- **[1.0.0]** - 2025-12-04 - Initial release

---

## How to Update This Changelog

When making changes to the project:

1. Add your changes under the `[Unreleased]` section
2. Use the appropriate category (Added, Changed, Fixed, etc.)
3. Write clear, concise descriptions
4. Include issue/PR references when applicable
5. When releasing, move unreleased changes to a new version section

### Example Entry

```markdown
### Added
- New Tafsir command for Quran interpretation (#42)
- Support for multiple languages in prayer times (#45)

### Fixed
- Prayer time calculation for southern hemisphere (#38)
- Memory leak in scheduled notifications (#41)
```

---

**Note**: Dates are in YYYY-MM-DD format following ISO 8601.
