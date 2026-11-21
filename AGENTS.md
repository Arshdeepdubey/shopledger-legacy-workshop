# Repository Guidelines

## Project Structure & Module Organization

- `server.js` starts the Express app and mounts the API routers in `routes/`.
- `lib/` contains business logic for orders, inventory, pricing, GST, coupons, invoices, reports, dates, storage, and the Khata ledger.
- `public/` contains `index.html`, browser code in `js/app.js`, and styles in `css/style.css`.
- `config.js` holds shop, tax, inventory, coupon, and port settings. `data/db.json` is the local JSON datastore and contains operational records.
- `docs/` contains project documentation and diagrams. There is no test directory or test suite currently.

## Build, Test, and Development Commands

- `npm start` runs `node server.js`; open `http://localhost:3000` unless `PORT` is set.
- There is no build step or configured linter/formatter.
- `npm test` is currently a placeholder that prints “Error: no test specified” and exits unsuccessfully. Do not treat it as a test suite; add focused automated tests when introducing one.

## Coding Style & Naming Conventions

Follow the existing CommonJS JavaScript style: two-space indentation, single-quoted strings, semicolons, and `var` declarations. Use descriptive camelCase function and variable names; route files are lowercase plural nouns (for example, `routes/orders.js`), and library modules use concise lowercase names (for example, `lib/pricing.js`). Keep HTTP handling in route modules and reusable business rules in `lib/`. Preserve the current JSON API shapes unless a change requires coordinated UI updates.

## Testing Guidelines

No framework, coverage target, or test naming convention is configured. For changes to order, tax, coupon, stock, or Khata calculations, manually verify relevant success and rejection cases and add automated tests alongside any test framework introduced. Do not claim `npm test` passes as validation.

## Commit & Pull Request Guidelines

Recent commit subjects are short, lowercase, and describe the change (for example, “customer khata credit ledger and order cancellation”). Follow that style with an imperative, specific summary. PRs should explain behavior changes, list verification performed, link the relevant issue when available, and include screenshots for visible UI changes.

## Data & Configuration

`data/db.json` is written by the running application; use disposable local data for manual checks and avoid committing real customer or transaction records. Review tax and coupon changes across both checkout (`lib/pricing.js`) and invoice rendering (`lib/invoice.js`), which calculate figures independently. Do not add credentials or production secrets to `config.js`.
