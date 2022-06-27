<div align="center">
  <img alt="Haku logo" src="public/images/icons/192.png" width="128" />
  <h1>Haku</h1>
</div>

<div align="center">
  <p>
    <strong>Craft, consolidate and tackle your notebooks and to-do lists all in one place…</strong>
  </p>
  <p>
    <a href="public/images/screenshots/wide-note.png" title="Screenshot of a note in Haku">
      <img alt="Screenshot of a note in Haku" src="public/images/screenshots/wide-note.png" width="384" />
    </a>
    <a href="public/images/screenshots/wide-todo.png" title="Screenshot of a to-do Haku">
      <img alt="Screenshot of a to-do Haku" src="public/images/screenshots/wide-todo.png" width="384" />
    </a>
  </p>
  <p>
    <a href="public/images/screenshots/narrow-home.png" title="Screenshot of the Haku landing page on mobile">
      <img alt="Screenshot of the Haku landing page on mobile" src="public/images/screenshots/narrow-home.png" width="128" />
    </a>
    <a href="public/images/screenshots/narrow-note.png" title="Screenshot of a note in Haku on mobile">
      <img alt="Screenshot of a note in Haku on mobile" src="public/images/screenshots/narrow-note.png" width="128" />
    </a>
    <a href="public/images/screenshots/narrow-todo.png" title="Screenshot of a to-do in Haku on mobile">
      <img alt="Screenshot of a to-do in Haku on mobile" src="public/images/screenshots/narrow-todo.png" width="128" />
    </a>
  </p>
   <p>
    <a href="https://github.com/HiDeoo/Haku/actions/workflows/integration.yml">
      <img alt="Integration Status" src="https://github.com/HiDeoo/Haku/actions/workflows/integration.yml/badge.svg" />
    </a>
    <a href="https://github.com/HiDeoo/Haku/blob/main/LICENSE">
      <img alt="License" src="https://badgen.net/github/license/HiDeoo/Haku" />
    </a>
  </p>
</div>

## Motivations

I write lots of notes and to-do lists on a daily basis. I tested a lot of different services and applications over the years to accomplish this but I never managed to find a solution that fits all my needs.

My most recent setup was composed of [OneNote](https://www.onenote.com) for notes and [Dynalist](https://dynalist.io) for to-do lists but I was still not satisfied with the result for various reasons, the most important ones being the lack of Markdown syntax and code highlighting in OneNote conjugated with the fact that every other text copy would fail on macOS for no reason, and the absence of a web version of Dynalist to open a to-do list on any device while I was on the go.

Haku - _**to compose, invent, put in order, arrange in Hawaiian**_ - is a **very opinionated** web application to consolidate in one place all my notes and to-do lists.

The note taking part of the application is inspired by [OneNote](https://www.onenote.com) and [Obsidian](https://obsidian.md) while the to-do lists take inspiration from [Dynalist](https://dynalist.io) and [Todo+](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-todo-plus).

## Features

- Heavily keyboard-focused workflows.
- Available as a web application or Progressive Web App that can be installed on desktop and mobile devices.
- Content-focused with hideable sidebars.
- Full text search.
- Passwordless authentication.
- Offline support (read-only at the moment).
- Allow-list of authorized users.
- Notes:
  - Markdown syntax.
  - Code highlighting.
  - Quick image upload à la GitHub.
  - Automatic table of contents.
- Todos:
  - List of to-do items with infinite levels of nesting.
  - Seamless keyboard navigation between to-do items like in a text editor.
  - Each to-do item is composed of a single-line text description which can be complemented by a note using Markdown syntax.
  - Every to-do item can be marked as completed or cancelled.
  - Missed to-do items are highlighted.
  - Nested to-do items can be collapsed.

## Architecture

- [Next.js](https://nextjs.org/) for the React application and API routes (hosted on [Vercel](https://vercel.com) in production).
- [Postgres](https://www.postgresql.org) database accessed through [Prisma](https://www.prisma.io) (hosted on [Supabase](https://supabase.com) in production and development - a local Docker version is used during tests).
- [NextAuth.js](https://next-auth.js.org) for the authentication.
- [tRPC](https://trpc.io) for end-to-end typesafe APIs.
- [Cloudinary](https://cloudinary.com) for image uploads.
- [EmailJS](https://www.emailjs.com) for sending authentication emails.

I am currently hosting a private instance of the application for my own use and don't plan to open it to the public at this time.

## License

Licensed under the MIT License, Copyright © HiDeoo.

See [LICENSE](https://github.com/HiDeoo/Haku/blob/main/LICENSE) for more information.
