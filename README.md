<div align="center">

# ⚽ Football IQ Academy

### Understand the beautiful game. One decision at a time.

An interactive football learning platform for exploring the Laws of the Game, player positions, formations, tactics, skills, and match situations.

Built with **Next.js, React, TypeScript, and Tailwind CSS**.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-149eca?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss)
![Deployment](https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel)

</div>

---

## 🏟️ About the Project

Football IQ Academy is an interactive educational website designed to make football easier to understand.

Rather than relying only on long explanations, the platform aims to help learners explore football visually through an interactive pitch, player positions, formations, tactical concepts, football rules, and match scenarios.

Whether you're a beginner learning the basics, a fan looking to understand tactics, or a player interested in improving your game knowledge, Football IQ Academy brings essential football concepts together in one place.

### 🎯 Project Goals

- Make football rules easier to understand.
- Explain player positions and responsibilities.
- Visualize formations and tactical concepts.
- Encourage learning through interactive scenarios and quizzes.
- Provide a responsive and accessible learning experience.

## ✨ Features

### ⚽ Interactive Football Pitch
Explore a visual football pitch and learn about player positions, responsibilities, and spatial relationships.

### 🧩 Formations and Player Positions
Discover common football formations and understand how defenders, midfielders, forwards, and goalkeepers contribute to a team's structure.

### 📘 Laws of the Game
Browse an organized index of the 17 Laws of the Game, with references to official football-rule resources.

### 🧠 Tactical Learning
Explore concepts such as attacking structure, defensive organization, pressing, spacing, and team movement.

### 🎮 Match Scenarios
Study football situations, consider possible decisions, and learn why particular outcomes may occur.

### 📝 Interactive Quizzes
Test your understanding of football rules and concepts through knowledge checks.

### 📖 Football Glossary
Learn the meanings of common football terms and tactical vocabulary.

### 🏃 Skills and Fundamentals
Explore foundational football techniques and concepts for developing a better understanding of the game.

### 📱 Responsive Interface
Designed to provide a usable experience across desktop, tablet, and mobile screens.

> **Note:** The README describes the intended project experience. Check the live implementation before assuming every feature or interaction is complete.

## 🧭 Website Sections

| Route | Description |
|---|---|
| `/` | Homepage and learning-section navigation |
| `/basics` | Football fundamentals |
| `/pitch` | Interactive pitch exploration |
| `/rules` | Index of the 17 Laws of the Game |
| `/rules/[slug]` | Individual football-law pages |
| `/positions` | Player positions and responsibilities |
| `/formations` | Football formation exploration |
| `/tactics` | Tactical concepts and team play |
| `/skills` | Football techniques and skills |
| `/scenarios` | Match situations and decision practice |
| `/referee` | Referee-related learning and decisions |
| `/glossary` | Football terminology |
| `/quiz` | Interactive knowledge checks |
| `/about` | Project information |

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Application framework and routing |
| React | Component-based user interface |
| TypeScript | Type-safe JavaScript development |
| Tailwind CSS | Styling and responsive layouts |
| SVG | Interactive pitch visualizations |
| Lucide React | Interface icons |
| Vercel | Recommended deployment platform |

## 🚀 Getting Started

Follow these instructions to run Football IQ Academy locally.

### Prerequisites

Install the following tools before starting:

- Node.js 20.9 or newer
- npm
- Git
- Visual Studio Code or another code editor

### 1. Clone the repository

Replace `<your-username>` with your GitHub username.

```bash
git clone https://github.com/<your-username>/football-iq-academy.git
```

Move into the project directory:

```bash
cd football-iq-academy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open the following address in your browser:

```text
http://localhost:3000
```

### 4. Build for production

Verify that the application can produce a production build:

```bash
npm run build
```

To run the production build locally:

```bash
npm run start
```

The production server uses the default port unless configured otherwise.

## ☁️ Deployment on Vercel

Football IQ Academy is designed to be deployed as a Next.js application.

### Deployment steps

1. Push the project to a GitHub repository.
2. Sign in to Vercel using your GitHub account.
3. Select **Add New → Project**.
4. Import the `football-iq-academy` repository.
5. Confirm that Vercel detects Next.js.
6. Review the build settings.
7. Click **Deploy**.
8. Open the deployed website and test its routes and interactions.

**Deployment platform:** [Vercel](https://vercel.com/)

After connecting the repository, Vercel can automatically deploy subsequent changes pushed to the configured Git branch.

## 📂 Project Structure

The main application is organized around the Next.js App Router.

```text
football-iq-academy/
├── public/
├── src/
│   └── app/
│       ├── about/
│       ├── basics/
│       ├── formations/
│       ├── glossary/
│       ├── pitch/
│       ├── positions/
│       ├── quiz/
│       ├── referee/
│       ├── rules/
│       ├── scenarios/
│       ├── skills/
│       ├── tactics/
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

*The exact folders and files may vary slightly depending on the current implementation.*

## 🗺️ Future Improvements

Potential enhancements for future development include:

- [ ] Add browser-based tests for navigation and interactive components.
- [ ] Improve keyboard navigation and accessibility.
- [ ] Add more interactive tactical diagrams.
- [ ] Expand formation comparisons and match scenarios.
- [ ] Improve quiz feedback and explanations.
- [ ] Add more visual examples of set pieces and team movement.
- [ ] Review football-law content against the latest official edition.
- [ ] Add screenshots and a demonstration GIF to the README.
- [ ] Optimize performance and test mobile layouts.
- [ ] Set up continuous integration for automated build checks.

## 📚 Official Resources and Documentation

Football rules can change, so official sources should be used when checking law details and referee decisions.

- [IFAB — Laws of the Game](https://www.theifab.com/laws/)
- [IFAB — Official Documents](https://www.theifab.com/documents/)
- [FIFA Football for Schools](https://footballforschools.fifa.com/en/index.php)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

## ⚠️ Disclaimer

Football IQ Academy is an independent educational project. It is not affiliated with or endorsed by FIFA or the International Football Association Board (IFAB).

The educational explanations and match scenarios are intended to support learning. For official interpretations, consult the current IFAB Laws of the Game and applicable competition regulations.

Verify the accuracy of football-law content and the licensing of external assets before using the project in a formal educational or commercial setting.

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

Before submitting a change:

1. Create a branch for your work.
2. Keep changes focused and easy to review.
3. Cite authoritative sources when changing football-law explanations.
4. Run the production build.
5. Test the affected pages and interactions.
6. Explain your changes and how you tested them in the pull request.

## 📄 License

No open-source license has been specified yet.

Until a license is added to the repository, assume that standard copyright applies. Do not assume that the project is licensed under MIT or another open-source license.

---

<div align="center">

### ⚽ Made for people who want to see more than just the ball.

**Football IQ Academy**

</div>