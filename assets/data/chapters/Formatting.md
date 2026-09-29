# Rich-Text Formatierung – Übersicht

## Unterstützte Felder

Folgende Felder unterstützen HTML-Formatierung:

- `task.intro`
- `task.subtitle`
- `task.prompt`
- `task.config.helps.hint1`
- `task.config.helps.hint2`
- `task.config.helps.solution`
- `task.textParts[].value` *(nur bei `type: "text"` in Cloze)*
- `task.options[].label` *(Single-Choice / Multiple-Choice)*
- `match-lines item.label` *(optional)*

---

## Erlaubte HTML-Tags

| Tag | Bedeutung |
|-----|----------|
| `<b>`, `<strong>` | Fett |
| `<i>`, `<em>` | Kursiv |
| `<u>` | Unterstrichen |
| `<br>` | Zeilenumbruch |
| `<p>` | Absatz |
| `<ul>`, `<ol>`, `<li>` | Listen |
| `<code>` | Monospace / Code |
| `<sup>`, `<sub>` | Hoch-/Tiefstellung |
| `<a>` | Links |

---

## Links

Nur folgende Protokolle sind erlaubt:

- `http`
- `https`
- `mailto`

**Beispiel:**

```html
<a href="https://example.com" target="_blank">Link</a>
```

---

## Beispiele

### Absatz + Formatierung

```html
<p>Das ist ein <strong>wichtiger</strong> Hinweis.</p>
```

### Liste

```html
<ul>
  <li>Erster Punkt</li>
  <li>Zweiter Punkt</li>
</ul>
```

### Zeilenumbruch

```html
Erste Zeile<br>Zweite Zeile
```

---

## Cloze-Text Beispiel

```json
"textParts": [
  { "type": "text", "value": "Das ist ein <strong>Beispiel</strong>." },
  { "type": "gap", "id": "g1", "options": ["A", "B"] }
]
```

---

## Single-/Multiple-Choice Beispiel

```json
"options": [
  { "label": "Antwort mit <strong>Formatierung</strong>", "value": "a" }
]
```

---

## Nicht erlaubt (wird entfernt)

- `<script>`, `<iframe>`, `<object>`, `<embed>`
- Event-Handler wie `onclick`, `onload`, etc.
- `style`-Attribute
- Unbekannte oder nicht freigegebene Tags/Attribute

---

## Hinweise

- Nur sichtbare Inhalte (`label`, Texte) sind formatierbar
- Technische Felder bleiben strikt Plain Text
- Alle Inhalte werden automatisch bereinigt (Sanitization aktiv)
