# Events & Meetings Guide

StudentHub supports running college events such as workshops, development sprints, and mentorship sessions. This guide outlines how to propose, manage, and RSVP for events.

Propose an event

- Open an issue using the "Feature request" template and include:
  - Event title, date/time, location (or video link)
  - Short description and target audience
  - Required roles (speakers, mentors, volunteers)

Admin approval

- Admins review event proposals in the Admin dashboard. Accepted events should include a public RSVP URL and maintainers should add the event to `pages/events.html`.

RSVP flow (recommended implementation)

- Store events in Supabase `events` table with `id,title,desc,start_time,end_time,location,host,max_attendees`.
- Provide a lightweight RSVP form that stores attendee name, email, role, and optional notes.
- Send confirmation via email (using a server function or third-party mail service) or display an on-screen ticket.

Day-of logistics

- Use the event page to list agenda, speakers, and resources.
- Provide links to meeting recordings and follow-up issues for ongoing project work.

Integrations

- Calendar: add iCal/Google Calendar export links for each event. Provide `Add to Google Calendar` buttons generated from the event metadata.
- Notifications: integrate a notifications system to announce upcoming events to site users (in-app or by email).
