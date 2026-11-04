# www.fahrlehrer-serband.de: notes for Claude

**Always reply to Serban in German**: simple, short, no jargon. He works on his phone.

Static site (HTML/CSS/JS, no build), GitHub Pages from `main`, custom domain via `CNAME`. Landing page = "film in chapters". All editable content (links, videos, classes, photos) is in `js/config.js`; see `README.md`. Reviews and the reaction-test leaderboard come from the **Fahr-Akademie** Supabase project (RPCs `website_*`), not from the Kompass project.
- Style: cinematic, dark green and gold. Texts: down-to-earth, a little melancholic, hopeful, no self-praise.
- Phone first; mobile videos are portrait (`videoHandy`).
- Work on a branch, ship via pull request.

## Memory: Obsidian vault
Serban's long-term memory lives in the private repo `serband1995-hue/obsidian-vault`.
- **Run `/vault` at the start of every session.** It loads his profile, binding working rules and this project's overview (~6k tokens instead of re-reading code or old chats).
- If the vault is missing: `add_repo` (owner `serband1995-hue`, repo `obsidian-vault`, access `push`), clone to `/home/user/obsidian-vault`, then `/vault`.
- Read only the notes the task needs (start from the index). Never the whole vault.
- Code beats vault: verify the real code before changing it; fix the vault if it is outdated.
- End of a larger task, or when Serban says "Vault aktualisieren": follow `CLAUDE.md` in the vault (session log, update notes, push to vault `main`).
- New task = new session: suggest it when a session gets long and the next task is unrelated.

## Agent-Team (seit 04.11.2026, Wunsch von Serband)
- Agent-Teams sind in `.claude/settings.json` eingeschaltet (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`), Hauptsitzung auf Opus als **Lead**.
- **Regel: Unabhängige Bau-Aufgaben an die Sonnet-Teammitglieder abgeben, damit der Kontext der Hauptsitzung klein bleibt.** Teammitglieder: `team-frontend` (Bildschirme), `team-backend` (Daten, Schnittstellen, Speicherung), `team-integration` (Testdaten, ganzer Ablauf). Dateibereiche stehen in `.claude/agents/team-*.md` und überschneiden sich nicht.
- Schema- und Konfig-Änderungen bleiben beim Lead.
- Besitz, Fortschritt und Abhängigkeiten laufen über die gemeinsame Aufgabenliste; Teammitglieder klären Schnittstellen und Blocker direkt untereinander per Nachricht.
- Opus übernimmt an drei Punkten: **bevor ein Plan feststeht**, **wenn ein Teammitglied blockiert ist**, **bevor etwas „fertig“ heißt** (gesamten Diff ansehen, Ablauf prüfen).
- Team nur bei Aufgaben mit mindestens zwei unabhängigen Teilen. Kleine Aufgaben macht der Lead allein (Teams kosten deutlich mehr Kontingent).
- Bestehende Regeln gelten weiter: Prüf-Team/Richter vor dem Merge, Tests grün, selbst mergen nach Serbands Merge-Regel.
