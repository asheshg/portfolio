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

The story frames use a hybrid editable implementation. Penpot exports in
`static/stories` provide exact background/photo pixels, while text, links,
pagination, story controls, and recreated card layers live as editable Svelte
markup and CSS in `src/routes/+page.svelte` and `src/routes/styles.css`.

## Deployment

This project uses SvelteKit with `@sveltejs/adapter-vercel`.
