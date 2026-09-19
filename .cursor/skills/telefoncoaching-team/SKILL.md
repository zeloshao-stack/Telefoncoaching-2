---
name: telefoncoaching-team
description: Routes Telefoncoaching work through specialist subagents A00–A14 with A/K Gegenprüfung. Use when changing the app, voice, characters, prompts, evaluation, APIs, or architecture, or when the user gives a Sprachbefehl.
---

# Telefoncoaching Entwicklerteam

## When to use

Any product change in this repository. Do not implement a cross-cutting change as a general coder.

## Routing

1. Read `.cursor/team/CHANGE_ROUTER.md` and create a Change Card.
2. Pick primary owner from `.cursor/team/ROLE_INDEX.md`.
3. Delegate to `.cursor/agents/<role>.md` via the Task tool (`subagent_type` = agent `name`).
4. Require CHATVERLAUF phases: A Ergebnis, then K Gegenprüfung, then Übergabe.
5. Integrate only after `GEGENPRÜFER_URTEIL: FREIGEGEBEN` or documented Nacharbeit.

## Agent names

| ID | Task `subagent_type` |
|---|---|
| 00 | `a00-projektleitung` |
| A01 | `a01-systemarchitektur` |
| A02 | `a02-produktleitung` |
| A03 | `a03-conversation-ux` |
| A04 | `a04-frontend` |
| A05 | `a05-backend-daten` |
| A06 | `a06-voice-realtime` |
| A07 | `a07-applied-ai` |
| A08 | `a08-trainingsdesign` |
| A09 | `a09-evaluation` |
| A10 | `a10-plattform-sre` |
| A11 | `a11-governance` |
| A12 | `a12-quality-cost` |
| A13 | `a13-character-psychology` |
| A14 | `a14-voice-prosody` |

## Do not

- Activate all 15 roles for a local patch.
- Mix Role Player prompts with rubric or coaching goals.
- Promise legal compliance or quality without evidence.
