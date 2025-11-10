# GitHub Setup for Claude Code Actions

This guide explains how to set up GitHub secrets for the Claude Code workflows to work properly with Z.AI API.

## Required Secrets

You need to add the following secrets to your GitHub repository:

### 1. ANTHROPIC_API_KEY
- **Value**: Your Z.AI API key
- **Example**: `828515b7cefd4ab8abbb739f263cb460.Si3Jxi3AYt6MhzTM`

### 2. ANTHROPIC_BASE_URL
- **Value**: Z.AI API endpoint
- **Example**: `https://api.z.ai/api/anthropic`

## Setup Steps

1. **Go to your GitHub repository**
2. **Navigate to Settings** → **Secrets and variables** → **Actions**
3. **Click "New repository secret"**
4. **Add the secrets**:

### Adding ANTHROPIC_API_KEY
```
Name: ANTHROPIC_API_KEY
Value: 828515b7cefd4ab8abbb739f263cb460.Si3Jxi3AYt6MhzTM
```

### Adding ANTHROPIC_BASE_URL
```
Name: ANTHROPIC_BASE_URL
Value: https://api.z.ai/api/anthropic
```

## Workflow Features

### 1. Automatic PR Reviews (claude-code-review.yml)
- **Triggers**: When PRs are opened or updated
- **What it does**: Reviews code changes and posts comments
- **Focus areas**: Code quality, bugs, security, performance, test coverage
- **File filtering**: Only runs for Java, resource files, pom.xml, and CLAUDE.md changes

### 2. Claude Assistant (claude.yml)
- **Triggers**: When someone mentions @claude in comments/issues
- **What it does**: Answers questions and provides assistance
- **Permissions**: Can comment on issues and PRs
- **Tools**: Has access to read files, search code, and run GitHub CLI commands

## Required Permissions

The workflows need these permissions (already configured):
- `contents: read` - Read repository content
- `pull-requests: write` - Comment on PRs
- `issues: write` - Comment on issues
- `id-token: write` - OAuth token generation
- `actions: read` - Read CI results

## Testing

### Test PR Reviews
1. Create a pull request with code changes
2. The workflow should automatically run and post a review comment

### Test Claude Assistant
1. Comment `@claude` on any issue or PR
2. Example: `@claude Can you help me understand the authentication system?`
3. Claude should respond with a helpful comment

## Troubleshooting

### Workflow doesn't run
- Check that secrets are properly configured
- Verify workflow permissions in repository settings
- Check Actions tab for error messages

### No comments posted
- Ensure `pull-requests: write` and `issues: write` permissions are set
- Check that Z.AI API key and base URL are correct
- Review workflow logs for authentication errors

### Rate limiting
- Z.AI may have rate limits
- Consider adding workflow triggers only when needed
- Monitor API usage in Z.AI dashboard

## Security Notes

- **Never commit API keys to your repository**
- **Use repository secrets, not environment secrets**
- **Rotate API keys regularly**
- **Monitor API usage for unusual activity**

## Alternative Setup

If you prefer using the official Anthropic API instead of Z.AI:

1. Change `ANTHROPIC_BASE_URL` to `https://api.anthropic.com` (or remove it)
2. Update `ANTHROPIC_API_KEY` to your official Anthropic API key
3. Note that official API may have different pricing and rate limits