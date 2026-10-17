# FlowSOP AI

FlowSOP AI turns a process description into a printable SOP, a Mermaid flowchart, and a contextual operations assistant.

## Run & Operate

- `npm run dev` — start the local Vite development server
- `npm run build` — create the production site in `dist/`
- `npm run preview` — preview the built site locally
- Netlify uses `npm run build` and publishes `dist/` via `netlify.toml`

## Stack

- React 18, Vite 5, Tailwind CSS 3
- Mermaid for generated process diagrams
- Lucide React for interface icons
- npm scripts and dependencies; this app does not use a pnpm workspace or a backend

## Where things live

- `index.html` — Spanish-language document shell and metadata
- `src/App.jsx` — process form, SOP, flowchart, and contextual assistant
- `src/index.css` — responsive styles and print-only rules
- `vite.config.js`, `tailwind.config.js`, `postcss.config.js` — build and styling configuration
- `netlify.toml` — Netlify build and publish settings
- `dist/` — generated production output

## Product

Users can edit an operational process, load an onboarding demo, generate the three deliverables, print the SOP, copy Mermaid source, and ask questions answered from the current form.

## Important behavior

- The assistant is a local contextual simulation, not a connected LLM.
- Process data is held in the current browser session and is not persisted.
- Keep the app's source and npm configuration at the project root; use only the requested dependencies.
