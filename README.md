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

## Editable Frames

The story frames are implemented as editable Svelte markup and CSS in
`src/routes/+page.svelte` and `src/routes/styles.css`. The site no longer renders
flattened PNG/SVG story exports.

## Deployment

This project uses SvelteKit with `@sveltejs/adapter-vercel`.
