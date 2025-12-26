# Contributing to WatchLog

First off, thank you for considering contributing to WatchLog!

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and what the expected behavior should be**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Follow the JavaScript/React styleguides
- Include appropriate test cases
- Update documentation as needed
- End all files with a newline

## Development Setup

1. Fork the repository
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/WatchLog.git
   cd WatchLog
   ```

3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/original-owner/WatchLog.git
   ```

4. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. Install dependencies:
   ```bash
   npm install
   ```

6. Create your `.env` file for local development:
   ```bash
   cp .env.example .env
   # Fill in your local credentials
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

## Workflow

1. Update your local master:
   ```bash
   git fetch upstream
   git checkout master
   git merge upstream/master
   ```

2. Create and switch to your feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```

3. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Add your commit message"
   ```

4. Push to your fork:
   ```bash
   git push origin feature/your-feature
   ```

5. Open a Pull Request on GitHub

## Additional Notes

### Issue and Pull Request Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `in progress` - Someone is already working on this
- `on hold` - Work has stopped

