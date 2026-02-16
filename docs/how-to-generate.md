# Generate Card Pages

Run the one-time generator script from the repository root:

`node tools/generate-cards.js`

This reads `data/cards.json` and regenerates:

- `/cards/{slug}.html` for every card in the dataset
- `/cards/index.html`
