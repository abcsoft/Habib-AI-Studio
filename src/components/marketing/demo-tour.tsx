"use client";
import { useState } from "react";
import Link from "next/link";
import { Play, ArrowRight, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CreativeCard } from "@/components/studio/creative-card";
const scenes = [
  {
    title: "01 · Make it your brand",
    text: "Create a brand kit with your audience, voice, and colors. Let's use Bloom Skincare.",
  },
  {
    title: "02 · Give your idea a home",
    text: "Create a project and introduce Daily Glow serum. Add the details that make your product different.",
  },
  {
    title: "03 · Choose your destination",
    text: "Select Product launch and Instagram & Facebook. Your campaign now has a clear purpose.",
  },
  {
    title: "04 · Find the creative direction",
    text: "Claude builds the strategy, audience insights, hooks, headlines, ad copy, and creative brief.",
  },
  {
    title: "05 · Bring it into focus",
    text: "Choose a concept. Send Claude's visual prompt to a separate image model to render your creative.",
  },
  {
    title: "06 · Keep the good stuff",
    text: "Save your campaign. Export the brief and copy, download images, and share with your team.",
  },
];
export function DemoTour({ hero = false }: { hero?: boolean }) {
  const [open, setOpen] = useState(false),
    [scene, setScene] = useState(0);
  return (
    <>
      <button
        className={hero ? "button button-outline" : "tour-play"}
        onClick={() => {
          setScene(0);
          setOpen(true);
        }}
        aria-label="Watch the studio walkthrough"
      >
        <Play size={hero ? 16 : 23} fill="currentColor" />
        {hero ? (
          "See how it works"
        ) : (
          <span>
            Take a studio tour <small>6 steps · about 75 seconds</small>
          </span>
        )}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="tour-dialog">
          <DialogTitle>{scenes[scene].title}</DialogTitle>
          <DialogDescription>{scenes[scene].text}</DialogDescription>
          <CreativeCard index={0} small />
          <p className="muted">
            Interactive walkthrough with a sample creative. No live API calls.
          </p>
          <div className="tour-controls">
            <span>
              {scene + 1} / {scenes.length}
            </span>
            {scene < scenes.length - 1 ? (
              <button
                className="button button-primary"
                onClick={() => setScene(scene + 1)}
              >
                Next step <ArrowRight size={15} />
              </button>
            ) : (
              <Link className="button button-primary" href="/demo?view=new">
                Try it yourself <Sparkles size={15} />
              </Link>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
