# Next.js 16.2+ Proxy Convention
The `middleware.ts` file convention is deprecated in favor of `proxy.ts`. 
Do NOT rename `proxy.ts` to `middleware.ts`. Always use `proxy.ts` for intercepting requests and routing (like next-intl).

# Commit Message & Git Push Rules
- Never use terms like "Phase 1", "phase one", "Section 1", "section one", or any phase/section numbering in commit messages.
- Keep commit messages extremely concise, brief, and standard (short 1-line Conventional Commit under 50 chars, e.g. `feat: ...`, `fix: ...`, `revert: ...`). Avoid long or verbose explanations.
- After every change (even minute changes), write a proper, concise, professional, and standard commit message.
- Do NOT ask the user for commit messages or confirmation. If the user feels there are problems, they will ask to undo them.
- Always follow AGENTS.md and automatically commit and push directly to `origin/main` every time.
