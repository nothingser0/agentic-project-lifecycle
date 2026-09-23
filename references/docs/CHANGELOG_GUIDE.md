# Changelog Guide — Mandatory for CLI/Library

**Purpose:** Document changes for users who depend on your package.

**Applies to:** CLI tools, libraries, APIs. Not applicable for internal web apps.

---

## When CHANGELOG is Mandatory

**MUST have CHANGELOG.md:**
- Published npm/PyPI/RubyGems package
- CLI tool distributed via GitHub releases
- Public API with versioning
- Open-source library with users

**Can skip:**
- Internal web app (not published)
- Prototype/spike
- Solo project with no users

---

## Format: Keep a Changelog

**Standard:** [keepachangelog.com](https://keepachangelog.com/)

**Structure:**
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Feature X in progress

### Changed
- Refactored Y

## [1.2.0] - 2026-09-22

### Added
- New `--verbose` flag for detailed output
- Support for `.env.local` files

### Changed
- Improved error messages
- Updated dependencies

### Fixed
- Fixed crash on empty config file

### Security
- Patched XSS vulnerability in template rendering

## [1.1.0] - 2026-09-15

### Added
- Added `init` command

### Deprecated
- `setup` command (use `init` instead)

## [1.0.0] - 2026-09-01

Initial release.

[Unreleased]: https://github.com/user/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/user/repo/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/user/repo/releases/tag/v1.0.0
```

---

## Categories

**Use these headings:**

- **Added:** New features
- **Changed:** Changes in existing functionality
- **Deprecated:** Soon-to-be removed features
- **Removed:** Removed features
- **Fixed:** Bug fixes
- **Security:** Security fixes

**Order:** Added, Changed, Deprecated, Removed, Fixed, Security (alphabetical)

---

## What to Include

**Include (user-facing changes):**
- ✅ New features
- ✅ Breaking changes
- ✅ Bug fixes
- ✅ Deprecations
- ✅ Security fixes
- ✅ Performance improvements (if significant)

**Exclude (internal changes):**
- ❌ Refactoring (unless changes API)
- ❌ Test improvements
- ❌ CI/CD changes
- ❌ Code style changes
- ❌ Dependency updates (unless fixes security)

**Example:**

```markdown
## [1.2.0] - 2026-09-22

### Added
- ✅ Added `--json` flag for JSON output

### Changed
- ✅ Improved error messages (now show file path)

### Fixed
- ✅ Fixed crash when config file missing

<!-- Excluded (internal) -->
<!-- - Refactored parser.ts -->
<!-- - Added unit tests for CLI -->
<!-- - Updated ESLint config -->
```

---

## Semantic Versioning (SemVer)

**Format:** MAJOR.MINOR.PATCH (e.g., 1.2.3)

**Rules:**
- **MAJOR** (1.0.0 → 2.0.0): Breaking change
- **MINOR** (1.0.0 → 1.1.0): New feature (backward compatible)
- **PATCH** (1.0.0 → 1.0.1): Bug fix (backward compatible)

**Examples:**

```markdown
## [2.0.0] - 2026-09-22 (MAJOR)

### Changed
- **BREAKING:** Renamed `--config` to `--config-file`

---

## [1.3.0] - 2026-09-15 (MINOR)

### Added
- Added `--watch` mode

---

## [1.2.1] - 2026-09-10 (PATCH)

### Fixed
- Fixed crash on Windows
```

---

## Breaking Changes

**Highlight clearly:**

```markdown
## [2.0.0] - 2026-09-22

### Changed
- **BREAKING:** Renamed `--config` flag to `--config-file`
- **BREAKING:** Removed `setup` command (use `init` instead)
- **BREAKING:** Minimum Node.js version is now 18 (was 16)

### Migration Guide

Before:
```bash
mytool --config ./config.json
mytool setup
```

After:
```bash
mytool --config-file ./config.json
mytool init
```
```

**Always include migration guide for breaking changes.**

---

## Deprecation Warnings

**2-version notice:**

```markdown
## [1.2.0] - 2026-09-22

### Deprecated
- `setup` command is deprecated and will be removed in v2.0.0. Use `init` instead.

---

## [2.0.0] - 2026-10-15

### Removed
- **BREAKING:** Removed `setup` command (use `init` instead, deprecated since v1.2.0)
```

**Timeline:**
- v1.2.0: Deprecate `setup`, add `init`
- v1.3.0 - v1.9.0: Both work, show warning
- v2.0.0: Remove `setup`

---

## Workflow

### 1. Update CHANGELOG on Every PR

**Before merge:**

```markdown
## [Unreleased]

### Added
- Added `--verbose` flag
```

**PR checklist:**
- [ ] Code changes
- [ ] Tests
- [ ] **CHANGELOG.md updated**

**Enforce in CI, not just the checklist.** A checklist item is a reminder, not a gate — it can be checked without being true. For Medium+ projects (where CHANGELOG is mandatory per the table above), add a CI check that fails the PR if `CHANGELOG.md` has no diff and the PR isn't labeled `no-changelog` (docs-only, CI config, dependency bump):

```yaml
# .github/workflows/changelog-check.yml
name: Changelog Check
on:
  pull_request:
    types: [opened, synchronize, labeled, unlabeled]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Require CHANGELOG.md update
        if: ${{ !contains(github.event.pull_request.labels.*.name, 'no-changelog') }}
        run: |
          git fetch origin ${{ github.base_ref }}
          if ! git diff --name-only origin/${{ github.base_ref }}...HEAD | grep -q '^CHANGELOG.md$'; then
            echo "CHANGELOG.md was not updated. Add an entry, or label this PR 'no-changelog' if it's docs/CI/dependency-only."
            exit 1
          fi
```

This turns "CHANGELOG.md updated" from an honor-system checkbox into something that actually blocks merge — consistent with how this skill treats other quality gates (security, performance, coverage) as evidence-required rather than checkbox-required.

---

### 2. Release Process

```bash
# 1. Move Unreleased to versioned section
# CHANGELOG.md:
## [1.2.0] - 2026-09-22

### Added
- Added `--verbose` flag

## [1.1.0] - 2026-09-15
...

# 2. Bump version in package.json
npm version minor  # 1.1.0 -> 1.2.0

# 3. Commit
git add CHANGELOG.md package.json
git commit -m "Release v1.2.0"

# 4. Tag
git tag v1.2.0
git push origin main --tags

# 5. Publish
npm publish

# 6. Create GitHub release (copy from CHANGELOG)
gh release create v1.2.0 \
  --title "v1.2.0" \
  --notes "$(sed -n '/## \[1.2.0\]/,/## \[1.1.0\]/p' CHANGELOG.md | head -n -1)"
```

---

### 3. Automated CHANGELOG & Release Tooling

**Option 1: Manual (Recommended for Small / Solo Projects)**
Edit `CHANGELOG.md` directly per Keep a Changelog.

**Option 2: Changesets (Recommended for Teams & Monorepos)**
[Changesets](https://github.com/changesets/changesets) avoids git merge conflicts on `CHANGELOG.md` across parallel PRs:

```bash
# Install
npm install -D @changesets/cli
npx changeset init

# On any feature PR, contributor runs:
npx changeset
# Prompts for semver bump (patch/minor/major) and summary message.
# Commits a temporary .changeset/cool-potato.md file.

# In CI: Changesets Action automatically aggregates entries and opens Release PR.
```

**Option 3: Semantic Release (Trunk-Based Automated CD)**
[Semantic-release](https://github.com/semantic-release/semantic-release) completely automates version bumping, CHANGELOG generation, and package publishing from Conventional Commits:

```bash
npm install -D semantic-release @semantic-release/changelog @semantic-release/git
```

**Option 4: Release-it (Interactive Single-Repo CLI)**
For teams preferring interactive confirmation before tagging: `npm install -D release-it @release-it/conventional-changelog`.

```
feat: add --verbose flag
fix: crash on empty config
BREAKING CHANGE: rename --config to --config-file
```

**Only use if team consistently follows commit conventions.**

---

## Examples

### Example 1: CLI Tool

```markdown
# Changelog

## [2.1.0] - 2026-09-22

### Added
- Added `--watch` mode to auto-reload on file changes
- Added color output (disable with `--no-color`)

### Changed
- Improved error messages: now show file path and line number

### Fixed
- Fixed crash when `.env` file has no content
- Fixed Windows path handling

### Security
- Updated `axios` to 1.6.0 (fixes CVE-2023-XXXXX)

## [2.0.0] - 2026-09-15

### Changed
- **BREAKING:** Minimum Node.js version is now 18 (was 16)
- **BREAKING:** Renamed `--config` to `--config-file`

### Removed
- **BREAKING:** Removed deprecated `setup` command (use `init`)

### Migration Guide

Before:
```bash
mytool --config ./config.json
```

After:
```bash
mytool --config-file ./config.json
```

## [1.5.0] - 2026-09-01

### Deprecated
- `setup` command is deprecated. Use `init` instead. Will be removed in v2.0.0.
```

---

### Example 2: Library (npm package)

```markdown
# Changelog

## [3.2.0] - 2026-09-22

### Added
- Added `validate()` method to `Config` class
- Added TypeScript strict mode support

### Fixed
- Fixed memory leak in `Parser.parse()`

## [3.1.0] - 2026-09-15

### Added
- Added `Config.fromJSON()` static method

### Deprecated
- `Config.load()` is deprecated. Use `Config.fromJSON()` instead.

## [3.0.0] - 2026-09-01

### Changed
- **BREAKING:** `Parser.parse()` now returns `Promise<AST>` (was synchronous)
- **BREAKING:** Minimum Node.js version is now 18

### Migration Guide

Before (v2.x):
```typescript
const ast = parser.parse(source)
```

After (v3.x):
```typescript
const ast = await parser.parse(source)
```
```

---

## Checklist

**Before publishing CLI/library:**

- [ ] CHANGELOG.md exists
- [ ] Follows Keep a Changelog format
- [ ] All user-facing changes documented
- [ ] Breaking changes highlighted with **BREAKING**
- [ ] Migration guide included for breaking changes
- [ ] Version follows SemVer (MAJOR.MINOR.PATCH)
- [ ] Git tag matches version (v1.2.0)
- [ ] GitHub release created with CHANGELOG excerpt

---

**Agent Instruction:**

For CLI/library projects:
1. Create `CHANGELOG.md` following Keep a Changelog format
2. On every PR: update "Unreleased" section
3. Before release:
   - Move "Unreleased" to versioned section (e.g., [1.2.0])
   - Bump version in `package.json`
   - Commit, tag, push
4. Create GitHub release with CHANGELOG excerpt

Do not publish without CHANGELOG. Users need to know what changed.

---

**Last Updated:** 2026-09-22  
**Version:** 1.0.0
