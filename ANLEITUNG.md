# So kommt der Code in dein Repo

Dieser Ordner ist ein Abzug der Telefoncoaching-App (Textloop + Docs + Gesamtwissen).  
Dieses Cloud-Gespräch kann **nicht** nach Telecommunication/GitHub pushen — dafür fehlt die Berechtigung, und es gibt hier keinen Create-repo-Knopf.

## Auf deinem Mac

Der Ordner liegt (sobald Cursor sync hat) hier:

```
~/Library/Application Support/Cursor/AgentStores/cursor_agent_stores/bc-65a89293-07d9-4b7b-8260-ce2bdcb7b129/files/repo
```

1. Telecommunication (oder ein neues leeres Repo) lokal klonen oder öffnen.
2. Den Inhalt von `files/repo` **hinein kopieren** (`app/`, `docs/`, `src/`, `package.json`, …).
3. `git add . && git commit -m "Telefoncoaching Textloop und Gesamtwissen" && git push`.
4. Danach in Cursor **dieses** Repo öffnen — nicht das New-Project-Gespräch.

Lokal starten: `npm install && npm run dev` → http://127.0.0.1:43147
