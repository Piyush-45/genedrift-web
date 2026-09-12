# Genedrift website — read this first

This folder is the **production website build** for genedrift.com, a global
Regulatory Affairs & Pharmacovigilance consultancy. It is a Next.js app plus the
project's own memory in `context/`.

## Before doing anything

Read `context/00-start-here.md`. It says which of the other context files matter
for the kind of task you have been given. Do not start editing code without it —
several decisions here look arbitrary and are not.

## What this folder is not

Catalyst (the publishing API), the Creator CMS and the editor widget live in a
**separate repo** and are not part of this build. This app only *consumes* the
Catalyst API. See `context/integration.md`.

## Hard rules

1. **No arbitrary Tailwind values.** No `text-[17px]`, no `#5B3FD2`. Everything
   comes from `styles/tokens.css`. If a value is missing, add a token.
2. **Fixtures before components.** Define the Zod schema and the fixture, then
   build the component against it.
3. **Animation stays in CSS**, with `prefers-reduced-motion` handled.
4. **Server components by default.** `"use client"` only for real interaction.
5. **Do not reintroduce `next/font/google`.** Fonts are self-hosted on purpose;
   the Google Fonts host is blocked and the build will fail.
6. **Never invent client content and present it as real.** Placeholder copy is
   fine and is expected — but say so. A fake job advert can have a real person
   apply to it.

## Working with Piyush

- Write files directly. Do not paste code into chat for him to copy.
- Ask when unsure rather than assuming.
- He does not disclose AI tooling to this client. Deliverables go out as his work.
- Do not pull in context from unrelated past chats — this folder is the context.

## Commands

    npm install
    npm run dev        # http://localhost:3000
    npm run typecheck
    npm run build
    npm run check      # all three
