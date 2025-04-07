# Contributing to Starknet Foundation

## Getting Started

### Prerequisites
1. Install Cairo 1.0 or higher
2. Install Scarb package manager
3. Set up a Starknet development environment

### Development Setup
1. Clone the repository
```bash
git clone https://github.com/yourusername/starknet-foundation.git
cd starknet-foundation
```

2. Install dependencies
```bash
scarb build
```

3. Run tests
```bash
scarb test
```

## Development Workflow

### Branch Naming Convention
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `test/*` - Test additions or modifications
- `refactor/*` - Code refactoring

### Commit Messages
Follow conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test updates
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

Example:
```
feat: add role-based access control
```

## Code Style Guidelines

### Cairo Style
1. Use clear, descriptive names
2. Follow Cairo naming conventions
3. Document complex logic
4. Keep functions focused and small
5. Use appropriate visibility modifiers

### Documentation
1. Document all public functions
2. Include usage examples
3. Explain complex algorithms
4. Update relevant documentation files

### Testing
1. Write unit tests for new features
2. Include integration tests
3. Maintain high test coverage
4. Test edge cases

## Pull Request Process

1. Create a new branch
2. Make your changes
3. Run tests locally
4. Update documentation
5. Submit PR with description
6. Address review comments
7. Await approval

### PR Description Template
```markdown
## Description
[Describe your changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Other (specify)

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests passing

## Documentation
- [ ] Documentation updated
- [ ] Examples added/updated
```

## Review Process

### Code Review Guidelines
1. Check code style
2. Verify test coverage
3. Review documentation
4. Test functionality
5. Consider security implications

### Approval Requirements
- At least one core maintainer approval
- All tests passing
- Documentation updated
- No security concerns

## Release Process

### Version Numbers
Follow semantic versioning:
- MAJOR.MINOR.PATCH
- Example: 1.0.0

### Release Steps
1. Update version numbers
2. Update changelog
3. Create release branch
4. Run final tests
5. Create release tag
6. Deploy to testnet
7. Deploy to mainnet

## Community

### Communication Channels
- GitHub Issues
- Discord Server
- Developer Forums

### Getting Help
1. Check documentation
2. Search existing issues
3. Ask in Discord
4. Create GitHub issue

## Code of Conduct

### Our Standards
- Be respectful and inclusive
- Focus on constructive feedback
- Maintain professional conduct
- Support community growth

### Enforcement
- Issue warnings
- Temporary bans
- Permanent bans
- Contact maintainers for concerns 