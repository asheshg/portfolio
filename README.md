# Portfolio

Story-driven SvelteKit portfolio for Ashesh Gohil.

## Interaction Model

- Tap or click the right side of the story card to advance.
- Tap or click the left side to go back.
- Swipe horizontally to move between sections.
- Use arrow keys for keyboard navigation.

## Development

```sh
npm install
npm run dev
```

## Penpot Assets

The story visuals are exported from Penpot into `static/stories/` as PNG files.
After changing the Penpot wireframes, reconnect the Penpot MCP server and run:

```sh
node scripts/export-penpot-stories.mjs
```

## Deployment

This project uses SvelteKit with `@sveltejs/adapter-vercel`.
