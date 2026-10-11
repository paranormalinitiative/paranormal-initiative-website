# TPI-UI-003 Header Controls

The existing account/Messenger control contains the authenticated avatar,
member name, account menu, New Chat, and Show/Hide behavior. It is still
created by `member-shell.js` and still uses the existing Messenger API and
session data.

On the two dedicated workspace routes, the collapsed control is now mounted
inside `[data-workspace-chat-slot]` in the workspace header. This reserves
actual header space instead of relying on a fixed top offset. When the owner
opens Messenger, the control is returned to `document.body` and the existing
resizable/movable full panel is restored.

The workspace title, protected-session indicator, and Back to TPI remain
separate header participants. Mobile rules place the account slot and actions
on intentional rows rather than forcing all controls into one line.
