import json
d = json.load(open('/tmp/tpi-e2e-body'))
yes = any('added you' in ((n.get('title') or '') + ' ' + (n.get('body') or '')).lower()
          and 'openChat=' in (n.get('actionHref') or n.get('action_href') or '')
          for n in d['notifications'])
print('YES' if yes else 'NO')
