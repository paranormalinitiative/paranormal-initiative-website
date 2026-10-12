# Functional test results

| Check | Result | Evidence |
| --- | --- | --- |
| Worker API JavaScript syntax | PASS | `node --check functions/api/[[path]].js` |
| Refine + Vite production build | PASS | `cd admin-center-app && npm run build` |
| ADMIN-006 static regressions | PASS | 9/9 checks |
| Reaction/report/history query integration | PASS (source) | Expanded protected member activity handler |
| Private conversation body suppression | PASS (source) | Conversations removed from member activity response |
| Authenticated member activity browser workflow | BLOCKED | No authorized test session |
| Real D1 data response comparison | BLOCKED | No local Worker/D1 session in Vite browser |
| Consequential mutation testing | NOT RUN | No production member mutation performed |

Release evidence:

- Source commit: `25b36ca` (`feat(admin): expand member activity operations`)
- Protected preview deployment: `8dac1b3c-d4f4-4e65-9e37-f8508c4c73ae`
