# Personalization

`member_personalization` stores `highlight` and `font` per owner. Allowed
highlights are theme, cryptid, fieldops, seance, cosmic, asylum, and
gothicnight; allowed fonts are default, modern, rounded, creator, serif, and
minimal. The API requires a member session and validates enums.

The local Settings test verifies authentication, enum validation, owner
isolation, persistence, public style lookup, and theme persistence. Status:
**PASS API; browser save/reload PARTIAL** because Playwright is unavailable.
