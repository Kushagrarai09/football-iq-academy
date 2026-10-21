import type { Metadata } from "next";
import Link from "next/link";
import ArcadeFootballGame from "@/components/game/ArcadeFootballGame";

export const metadata: Metadata = {
  title: "Play Arcade Football",
  description: "Play a classic 2D arcade football prototype. Move around the pitch, shoot, pass and play in fullscreen.",
};

export default function PlayPage() {
  return (
    <section className="play-page">
      <div className="play-page__breadcrumb"><Link href="/">Home</Link><span>/</span><span>Play</span></div>
      <div className="play-page__intro">
        <div>
          <div className="arcade-eyebrow">A NEW WAY TO LEARN FOOTBALL</div>
          <h1>Get on the <span>pitch.</span></h1>
          <p>Move, sprint, shoot and pass in a classic side-view arcade playground. This is the first playable build: more players and smarter opposition are coming next.</p>
        </div>
        <div className="play-page__pill">🎮 <span>PHASE 1 · PLAYABLE PROTOTYPE</span></div>
      </div>
      <ArcadeFootballGame />
    </section>
  );
}
