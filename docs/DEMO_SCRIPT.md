# Habib AI Studio — 75-second demo script

The landing page includes a recorded 75-second public-demo walkthrough at `public/studio-demo.mp4`, with an optimized poster and English WebVTT captions. It has no audio track; the voiceover below is ready for recording. The video shows simulated generations and does not imply live Claude or image-provider calls.

To reproduce, start `pnpm dev`, then run `node scripts/record-demo.mjs`. The recording details are written to `.local-tools/video/recording.json`. Encode the WebM to H.264 MP4 with FFmpeg, trimming `trimStart`, padding the last frame if necessary to reach 75 seconds, and using `-pix_fmt yuv420p -movflags +faststart`. Keep the provided captions aligned with the scene times.

Record at 1440×900 or 1280×720. Use the public demo or a staging account. If recording the public demo, keep the sample-mode disclosure visible and identify generation as simulated. Do not imply a sample result is a live provider call or a real client's campaign.

| Time   | On screen                                                    | Voiceover                                                                                                                                                              |
| ------ | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0–7s   | Landing hero, then enter studio                              | “A good idea deserves a creative direction. Meet Habib AI Studio: your workspace for campaign strategy, copy, and visuals.”                                            |
| 7–17s  | Brand kits → create Bloom Ritual; audience, voice, colors    | “Start with your brand. Add who you're speaking to, how you sound, and the colors that make it yours.”                                                                 |
| 17–27s | Create Daily Glow project; enter product details             | “Give your campaign a home. Introduce your product and the real details that make it different.”                                                                       |
| 27–34s | Select Product launch and Instagram & Facebook; create draft | “Choose the goal and channel. We're introducing a daily serum on Instagram and Facebook.”                                                                              |
| 34–45s | Generate package; show strategy and audience                 | “In live mode, Claude develops a campaign strategy, audience insights, and creative concepts—all guided by your brand. This walkthrough uses the offline sample mode.” |
| 45–54s | Ad copy tab; hooks, headlines, and copy                      | “Explore hooks, headlines, and ad copy in your voice. Keep the direction you like, then review the details before publishing.”                                         |
| 54–65s | Visual prompts → generate image → visual appears             | “Claude constructs the visual prompt. A separate image model handles rendering. In the sample workspace, we reuse demo artwork to illustrate that step.”               |
| 65–72s | Save campaign, export package, show saved assets             | “Save the campaign. Export your brief and copy, download the visuals, and keep everything connected to your project.”                                                  |
| 72–75s | Overview and domain/end card                                 | “Your next creative direction starts at mdhabiburrahman.xyz.”                                                                                                          |

Use calm cursor movement, readable text, and minimal transitions. The live workflow spends 3 credits for a campaign package and 1 for an image. Failed generations are refunded. Do not claim increased sales, a guaranteed creative result, or exclusive ownership of AI imagery.
