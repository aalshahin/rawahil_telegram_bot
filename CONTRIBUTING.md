# Contributing to Rawahil Telegram BOT 🤝

First off, thank you for considering contributing to Rawahil Telegram! It's people like you that make this bot a great tool for the Muslim community.

## 📜 Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- **Be respectful**: Treat everyone with respect and kindness
- **Be constructive**: Provide helpful feedback and suggestions
- **Be collaborative**: Work together towards common goals
- **Be inclusive**: Welcome newcomers and diverse perspectives

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- Node.js v18.x or higher installed
- npm v9.x or higher
- Git installed and configured
- A Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- Basic knowledge of TypeScript and Node.js

### Setting Up Your Development Environment

1. **Fork the repository**
   
   Click the "Fork" button at the top right of the repository page.

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/rawahil_telegram_bot.git
   cd rawahil_telegram
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/aalshahin/rawahil_telegram_bot.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Create a `.env` file**
   ```bash
   cp .env.example .env
   ```
   
   Add your bot token and other required credentials.

6. **Build and run**
   ```bash
   npm run build
   npm start
   ```

## 🔄 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features (e.g., `feature/add-tafsir-command`)
- `fix/` - Bug fixes (e.g., `fix/prayer-time-calculation`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/service-layer`)
- `test/` - Adding tests (e.g., `test/hadith-service`)

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Update documentation as needed
- Keep commits focused and atomic

### 3. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add Tafsir command for Quran verses"
```

Commit message format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### 4. Keep Your Branch Updated

Regularly sync with the upstream repository:

```bash
git fetch upstream
git rebase upstream/main
```

### 5. Push Your Changes

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template
5. Submit the pull request

## 📝 Pull Request Guidelines

### Before Submitting

- [ ] Code builds without errors (`npm run build`)
- [ ] All existing tests pass
- [ ] New features include appropriate tests
- [ ] Documentation is updated
- [ ] Commit messages are clear and descriptive
- [ ] Code follows the project's style guidelines

### PR Description Should Include

- **What**: Brief description of changes
- **Why**: Reason for the changes
- **How**: Technical approach taken
- **Testing**: How you tested the changes
- **Screenshots**: If UI changes are involved
- **Related Issues**: Link to related issues

### Example PR Description

```markdown
## What
Added Tafsir (Quranic interpretation) command to the bot

## Why
Users requested the ability to read interpretations alongside Quran verses

## How
- Created new `tafsir.service.ts` for fetching interpretations
- Added `tafsir.handler.ts` for handling user requests
- Integrated with Tafsir API
- Added inline keyboard for verse selection

## Testing
- Tested with various Surah and Ayah combinations
- Verified error handling for invalid inputs
- Checked API rate limiting

## Screenshots
[Add screenshots here]

## Related Issues
Closes #42
```

## 🐛 Reporting Bugs

### Before Reporting

1. Check if the bug has already been reported in [Issues](https://github.com/aalshahin/rawahil_telegram_bot/issues)
2. Ensure you're using the latest version
3. Verify the bug is reproducible

### Bug Report Should Include

- **Description**: Clear description of the bug
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: 
  - Node.js version
  - npm version
  - Operating system
- **Logs**: Relevant error messages or logs
- **Screenshots**: If applicable

## 💡 Suggesting Features

We welcome feature suggestions! Please:

1. Check if the feature has already been suggested
2. Clearly describe the feature and its benefits
3. Provide use cases and examples
4. Consider implementation complexity

## 🧪 Testing

### Running Tests

```bash
# Run all tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write tests for new features
- Ensure tests are clear and maintainable
- Test edge cases and error conditions
- Aim for good code coverage

## 📋 Code Style Guidelines

### TypeScript Best Practices

- Use TypeScript strict mode
- Define proper types and interfaces
- Avoid `any` type when possible
- Use meaningful variable and function names

### File Organization

- One component/service per file
- Group related files in directories
- Use index files for clean imports
- Follow the existing folder structure

### Naming Conventions

- **Files**: `kebab-case.ts` (e.g., `prayer.service.ts`)
- **Classes**: `PascalCase` (e.g., `PrayerService`)
- **Functions**: `camelCase` (e.g., `getPrayerTimes`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `BOT_TOKEN`)

### Code Formatting

- Use 2 spaces for indentation
- Add semicolons at the end of statements
- Use single quotes for strings
- Keep lines under 100 characters when possible

## 🔍 Code Review Process

1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Maintainer Review**: A maintainer will review your PR
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, your PR will be merged
5. **Cleanup**: Delete your branch after merging

## 📚 Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [node-telegram-bot-api Documentation](https://github.com/yagop/node-telegram-bot-api)

## 🎯 Areas We Need Help With

- Adding more Islamic content sources
- Improving prayer time accuracy
- Adding multi-language support
- Writing comprehensive tests
- Improving documentation
- UI/UX enhancements for bot interactions

## 💬 Questions?

If you have questions:

1. Check existing documentation
2. Search through [Issues](https://github.com/aalshahin/rawahil_telegram_bot/issues)
3. Create a new issue with the "question" label

## 🙏 Thank You!

Your contributions make Rawahil Telegram better for everyone. We appreciate your time and effort!

---

**JazakAllahu Khairan** (May Allah reward you with goodness) for contributing! 🌟
