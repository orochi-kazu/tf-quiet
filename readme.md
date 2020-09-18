# terraform plan --quiet

The output of large terraform plans is super noisy.
This app intends to add some nice UX around it, to highlight the most relevant bits.

[Live version on Github Pages](https://orochi-kazu.github.io/tf-quiet/src)

## Local use

For commits before adding native ES modules, just open `src/index.html`.

For later commits, a web server is required due to CORS restrictions on modules.

A dev-only static file server is provided via npm:

```
nvm use
npm install
npm start
```

## Roadmap

- [x] Highlight unfiltered output
- [x] Collapse resources
- [x] Hide lines with no changes
- [x] Publish as interactive app

## Contributing

Send me a PR, why not? :3
