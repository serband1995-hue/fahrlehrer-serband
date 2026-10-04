# www.fahrlehrer-serband.de: notes for Claude

**Always reply to Serband in German**: simple, short, no jargon. He works on his phone.

Static site (HTML/CSS/JS, no build), GitHub Pages from `main`, custom domain via `CNAME`. Landing page = "film in chapters". All editable content (links, videos, classes, photos) is in `js/config.js`; see `README.md`. Reviews and the reaction-test leaderboard come from the **Fahr-Akademie** Supabase project (RPCs `website_*`), not from the Kompass project.
- Style: cinematic, dark green and gold. Texts: down-to-earth, a little melancholic, hopeful, no self-praise.
- Phone first; mobile videos are portrait (`videoHandy`).
- Work on a branch, ship via pull request.

## Memory: Obsidian vault
Serband's long-term memory lives in the private repo `serband1995-hue/obsidian-vault`.
- **Run `/vault` at the start of every session.** It loads his profile, binding working rules and this project's overview (~6k tokens instead of re-reading code or old chats).
- If the vault is missing: `add_repo` (owner `serband1995-hue`, repo `obsidian-vault`, access `push`), clone to `/home/user/obsidian-vault`, then `/vault`.
- Read only the notes the task needs (start from the index). Never the whole vault.
- Code beats vault: verify the real code before changing it; fix the vault if it is outdated.
- End of a larger task, or when Serband says "Vault aktualisieren": follow `CLAUDE.md` in the vault (session log, update notes, push to vault `main`).
- New task = new session: suggest it when a session gets long and the next task is unrelated.
