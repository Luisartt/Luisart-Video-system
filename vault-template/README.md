# Vault template

A ready-made skeleton for the knowledge base that feeds your videos (Obsidian + Markdown, run by an AI).
Guided setup: ask your assistant "create my wiki" (skill `wiki-vault-setup`).

**Why it is built this way**
- **Two inboxes** (`rawcc`, `rawc`) so you can save things in one gesture (Web Clipper, drag a file) and
  decide nothing at that moment. The AI processes them only when you ask.
- **A database next to each inbox** (`Content/`, `Knowledge-Sources/`): your originals, filed by category, never
  edited. The wiki can always be rebuilt from them.
- **A wiki the AI owns** (`wiki/`): notes it writes from your sources, in a fixed shape so they stay consistent
  and searchable. You read; it writes.
- **Two divisions that never mix while editing**: editing reads only Content Creation (fast, focused);
  scripts may read Knowledge (read-only) to add substance.
- **Personal notes stay yours**: the AI does not open them unless you ask.

Copy this folder to where you want your vault (for example `Documents/MyVault`), open it in Obsidian
("Open folder as vault"), and read `CLAUDE.md` — it is the manual the AI follows.
