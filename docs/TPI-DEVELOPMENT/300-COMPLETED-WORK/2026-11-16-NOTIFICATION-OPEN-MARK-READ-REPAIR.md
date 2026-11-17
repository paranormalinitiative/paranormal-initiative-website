# Notification Open Mark-Read Repair

Date: 2026-11-16
Incident: `TPI-NOTIFICATION-OPEN-READ-2026-11-16`

Status: **Implemented and protected in source; production release follows the maintained guarded workflow**

## Reported impact

Opening a member notification should acknowledge that the member has seen it.
The existing action could leave the notification unread because the page began
navigation before the best-effort read request finished.

## Confirmed cause

The notification action was a normal same-page link, but its read request was
started asynchronously without a navigation-safe transport. Chrome, Firefox,
or Safari could unload the notification page before the request reached the
Worker.

## Repair

- A normal left-click now prevents the immediate default navigation long enough
  to queue the read state change.
- `navigator.sendBeacon` is used first because it is designed to survive page
  navigation.
- A `fetch(..., { keepalive: true })` fallback is used when Beacon cannot queue
  the request, with a short timeout so a slow service cannot trap the member.
- The member is then sent to the exact notification destination, including the
  Community Feed post and comment deep link.
- Modified-click behavior (new tab, new window, or user-requested alternate
  navigation) remains a normal browser action.
- Marking a notification read does not delete it; it remains available in the
  notification list and filters.

## Protection

The shared member interaction verification now requires the navigation-safe
read path, Beacon transport, keepalive fallback, and preserved normal
notification link. The server continues to scope the read mutation to the
authenticated notification recipient.

StudioFlow, Nova Workspace, Creator Studio, and other protected applications
are outside this change.
