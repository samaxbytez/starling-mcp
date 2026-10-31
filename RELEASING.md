# Releasing

Releases follow [Conventional Commits](https://www.conventionalcommits.org/). `main` squash-merges, so the PR title is the commit that counts.

| Commit type | Bump |
| --- | --- |
| `feat:` | minor |
| `fix:` / `perf:` | patch |
| `feat!:`, `fix!:` or a `BREAKING CHANGE:` footer | major |
| `chore:` `docs:` `refactor:` `test:` `ci:` | none |

A change to the version of a bundled dependency (the MCP SDK or zod) is a releasable patch even if the commit says `chore:`, because it changes the published file.

## Steps

1. Merge the feature and fix PRs.
2. Open a release PR that bumps `package.json` and updates the changelog.
3. Merge it. `publish.yml` runs: the `build` job checks, builds, smoke-tests and attack-tests; if the version is new, the `publish` job waits for approval in the `npm-publish` environment, then publishes with provenance and creates the tag and GitHub Release.
4. Verify: `npm view starling-mcp` shows the new version and no dependencies, the GitHub Release exists, and `npx starling-mcp@latest` starts.
