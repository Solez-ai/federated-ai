# Privacy-Preserving AI

Interactive research website for Samin Yeasar's IARCO 2025 project on federated learning, differential privacy, secure aggregation, and personalization for medical imaging.

## Overview

This project is a production-focused Next.js experience that turns the research proposal into a visual, scroll-driven website. The site combines real-time graphics, animated interface systems, and a local browser-side research assistant grounded in the proposal itself.

The experience is designed as an interactive presentation rather than a static paper page.

## Stack

- `TypeScript`
- `Next.js 16`
- `React 19`
- `Tailwind CSS 4`
- `Framer Motion`
- `React Three Fiber`
- `Drei`
- `Three.js`
- `GSAP`
- `Lenis`
- `@xenova/transformers`

## Core Sections

- Hero network simulation
- Data silos and breach problem framing
- Federated learning walkthrough
- Differential privacy and privacy-utility tradeoff
- Personalization visualization
- Secure aggregation explainer
- Methodology and expected results
- Global impact and conclusion
- Local browser research assistant
- Creator / author credit section

## Local Research Assistant

The site includes a browser-side assistant branded as `Samin's Research AI`.

It is not a general-purpose chatbot. It is a proposal-grounded retrieval interface that uses:

- `Xenova/all-MiniLM-L6-v2`
- `@xenova/transformers`
- precomputed embeddings stored in `app/research_proposal_embedding.json`

The assistant is constrained to the project knowledge base and is intentionally labeled as a beta research system.

## Performance Notes

The production build is optimized around reducing scroll jank without changing the visual identity.

Key decisions:

- heavy R3F scenes are mounted only when their section is near the viewport
- global interaction loops were trimmed to reduce constant work during scrolling
- shared UI helpers were cleaned up to avoid unnecessary repeated animation cost
- the browser-side assistant uses precomputed vectors instead of building the index on every visit

## Creator

The project and website were created by:

- `Samin Yeasar`
- Birshreshtha Munshi Abdur Rouf Public College
- IARCO 2025

The bottom creator section in the site is the canonical visual credit block for the author.

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## Project Structure

```text
app/
  layout.tsx
  page.tsx
  globals.css
  icon.svg
  research_proposal_embedding.json

components/
  AISection.tsx
  CreatorSection.tsx
  FederatedLearning.tsx
  HeroSection.tsx
  ImpactAndConclusion.tsx
  MethodologyAndResults.tsx
  Navbar.tsx
  NodeNetwork.tsx
  Personalization.tsx
  Preloader.tsx
  PrivacyAndTradeoff.tsx
  ProblemSection.tsx
  QuoteButton.tsx
  SecureAggregation.tsx
  SmoothScroll.tsx
  TargetCursor.tsx
  TextScramble.tsx
  retrieval.worker.ts

public/
  image1.png
  image2.png
  sounds/
```

## Production Checklist

- Run `npm run build`
- Verify smooth scrolling on desktop and mobile
- Confirm browser-side assistant returns proposal-grounded answers
- Check creator links and paper link targets
- Confirm audio behavior is acceptable in the deployment environment
- Validate that the favicon is loading correctly

## License

This repository contains original project and presentation code for the research website. Reuse should preserve creator credit unless explicitly relicensed by the author.
