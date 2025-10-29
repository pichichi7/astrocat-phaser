# How Kiro Helped Me Build My First Real Game

**Background:** Lawyer trying to learn game development  
**Project:** ASTROCAT - A puzzle game for Reddit  
**Timeline:** 2 weeks (Oct 15-29, 2025)  
**Tools:** Phaser (game engine I'd never used), Reddit's Devvit platform (also new to me)

---

## The Hook

**Week 1:** I built a "pretty" level editor that broke on mobile and let players share impossible-to-solve puzzles. Spent 12 hours, rewrote it three times, almost quit.

**Week 2:** I forced myself to write requirements before touching code. Used Kiro's documentation system to structure my thinking. Built the same editor in 6 hours. It worked. No rewrites.

This is that story.

---

## Why I'm Sharing This

I'm not a professional developer. I'm a lawyer who got into coding during lockdown and has been fumbling through side projects ever since. When I saw this hackathon, I thought "why not try something ridiculous?"

The truth is, I almost quit. Week one was a disaster. Then I tried Kiro's spec-driven workflow on one feature, and something clicked. I'm sharing this because if a non-dev like me can benefit from structured planning, maybe you can too.

This isn't sponsored. I'm just documenting what worked.

ASTROCAT is a Q*bert-style puzzle game where you jump on cubes to change their colors. But I wanted to make it more than just a game—I wanted players to create and share their own levels on Reddit.

This meant I needed:
1. The actual game mechanics (jumping, physics, win conditions)
2. A level editor so people could design puzzles
3. A way to share levels to Reddit and have others play them
4. Some kind of leaderboard system

For context: I'd never built a game before. I'd never used Phaser. I'd never worked with Reddit's development platform. I was basically learning three new things at once while racing against a deadline.

---

## The Disaster: My First Week

I started the way I always do with side projects: jump in and figure it out as I go. I'd been using GitHub Copilot for a few months and felt pretty confident—just describe what you want, let the AI write it, fix the bugs, repeat.

This worked fine for simple stuff like the splash screen and menu. But when I got to the level editor (the most important feature), everything fell apart.

### What Went Wrong

**Day 3:** I asked Copilot to create UI panels for the editor. It gave me 200 lines of code. I pasted it in, ran it, and... the layout was completely broken on mobile. Spent 2 hours trying to fix responsive CSS I barely understood.

**Day 4:** Scrapped that approach. Tried a completely different layout system. Got it looking better, but then realized I'd forgotten to implement the actual validation logic (making sure player-created levels are actually solvable). Another 3 hours wasted.

**Day 5:** Added validation as an afterthought. Implemented basic pathfinding, but it didn't work with the isometric grid math. Had to rewrite the entire coordinate system. 4 more hours gone.

**Day 6:** Built the Reddit sharing feature, but the data format didn't match what I'd set up in the backend. Had to redesign how levels get saved and loaded. 3 hours of refactoring.

By the end of week one, I'd spent **12 hours on the editor** and it still had bugs. I was demoralized and honestly considering just submitting a simpler version without the level creation feature.

### Why "Just Start Coding" Failed Me

Looking back, the problem was obvious:
- I never wrote down what the editor actually needed to do
- I had no plan for how the pieces fit together  
- I kept discovering requirements mid-development ("oh wait, I need validation")
- I built things in the wrong order (sharing before validation made no sense)

I was coding reactively—building something, discovering a problem, scrambling to fix it, creating new problems in the process.

---

## Finding Kiro (Day 7)

On Day 7, feeling pretty defeated, I was reading through the hackathon rules again and saw something about Kiro's documentation system. Honestly, my first thought was "great, more overhead I don't have time for."

But I was desperate. I decided to try it on just one feature—the "browse community levels" screen—to see if it actually helped or just slowed me down.

What happened next surprised me.

---

## How Kiro Actually Works (In Plain English)

Kiro has three steps, and they're not complicated:

### Step 1: Write Down What You Need (Requirements)

Instead of jumping into code, you write out what the feature should do in plain language. Kiro uses a format called EARS notation, which sounds fancy but is just: "WHEN [something happens] THE SYSTEM SHALL [do something]."

For the browse levels screen, I wrote things like:

```
WHEN user opens the browse screen
THE SYSTEM SHALL fetch the 50 most recent levels from Reddit
AND display them in a scrollable list
```

```
WHEN user clicks PLAY on a level
THE SYSTEM SHALL load that level's data
AND start the game with that custom level
```

That's it. Just describing what I wanted in clear terms.

**Why this helped:** Writing it out made me realize I hadn't thought about empty states, loading indicators, or error handling. In the past, I'd discover these mid-coding and hack solutions together. This time, I caught them upfront.

### Step 2: Plan The Structure (Design)

Before touching code, Kiro had me sketch out how the pieces fit together. What data structures do I need? What does the backend API look like? How do the frontend and backend talk to each other?

For the browse screen, this meant defining:
- What a "shared level" object looks like (id, name, creator, difficulty, etc.)
- What API endpoint I'd call (`GET /api/levels/all`)
- What happens when you click Play (fetch full level data, transition to game scene)

**Why this helped:** I've always been terrible at seeing the big picture. I code one function, then realize it doesn't fit with something else I built yesterday. Having this architecture laid out meant no surprises when I actually started implementing.

### Step 3: Break It Into Pieces (Tasks)

Finally, Kiro helped me break the feature into specific, testable chunks. Not huge tasks like "build browse screen," but concrete pieces like:

- TASK-21: Create the scrollable UI layout
- TASK-22: Add API call to fetch levels
- TASK-23: Wire up the Play button

Each task had clear "done" criteria, so I knew exactly when to move on.

**Why this helped:** I could make actual progress. Instead of being "90% done" forever (my usual state), I could check off tasks and feel like I was getting somewhere.

---

## The Difference It Made

Using Kiro for that one feature (browse levels) took me **4 hours total**. Based on my week-one performance, it probably would've taken 8 hours without planning.

But more importantly: **it didn't need any rewrites**. No "oh crap, I built this backwards." No discovering critical requirements after half the code was written. I built it once, it worked, I moved on.

That's when I decided to rebuild the level editor using the same approach.

---

## Rebuilding The Editor (The Right Way)

I scrapped my buggy editor and started over. But this time, I spent Day 8 just writing requirements. 23 user stories covering everything from "how do you place blocks" to "what happens if someone tries to share an unsolvable level."

It felt slow. Part of me kept thinking "I should be coding!" But I forced myself to finish the planning.

**Day 9:** I worked on the design doc. Drew out the data structures, mapped the validation algorithm (BFS pathfinding to make sure the goal is reachable), defined the API for sharing levels.

Here's the key thing I discovered: the design doc revealed I needed to refactor my coordinate system BEFORE building the editor. If I'd discovered this mid-development like last time, it would've been a 4-hour emergency rewrite. Instead, I just... built it right from the start.

**Day 10:** Broke everything into tasks. Eleven specific pieces, each with clear "how do I know this is done" criteria.

**Days 11-12:** Actually coded it. And here's the weird part—it went FAST. Every task took 30-60 minutes, exactly as estimated. Copilot's suggestions actually made sense because the TypeScript interfaces were already defined. I knew exactly what order to build things in.

Total time: **6 hours of work** (plus the 2 hours of planning). Compare that to 12 hours of chaos in week one.

And it worked. No major bugs. No refactors. The validation logic correctly caught all the edge cases I'd thought through in the requirements. The sharing system worked because the data formats matched between frontend and backend.

---

## What Kiro Actually Gave Me (Honest Assessment)

### 1. It Made Me Think Before Coding

As someone without formal training, I've always relied on trial-and-error. Code something, see if it works, fix it if it doesn't. 

I forced myself to think through problems BEFORE writing code, which felt unnatural at first but saved me so much debugging time. Kiro gave me the framework to actually do this—the EARS notation, the design templates, the task breakdowns. Without that structure, I'd have fallen back into "just start coding" mode.

### 2. It Gave Me A Roadmap When I Was Lost

Halfway through Day 11, I got stuck on a bug and felt that familiar panic of "I have no idea what I'm doing." But I could look at my tasks list and see: "Okay, I'm on TASK-15 out of 11 tasks. I'm actually 70% done, not failing." That psychological boost mattered a lot.

### 3. It Helped Me Avoid Stupid Mistakes

The requirements forced me to think about edge cases. The design doc made me define data structures upfront so frontend and backend matched. The tasks kept me from building features in the wrong order. All stuff I *should* do anyway, but never actually did on my own.

### 4. It Created Documentation I Actually Need

I have a bad habit of building something, then forgetting how it works two days later. With Kiro's system, I have clear documentation of what every feature does and why I built it that way. If I come back to this project in six months, I won't be completely lost.

### 5. Real Evidence This Worked

Here's a concrete example. My level-schema-sync hook caught this mismatch before I even committed:

```
[kiro] schema drift detected:
  SharedLevelMeta.difficulty: 'easy'|'medium'|'hard' (frontend)
  vs
  LevelData.difficulty: 1|2|3 (backend)
```

I fixed it in 2 minutes instead of discovering it in production when someone's shared level exploded. That alone justified the whole system.

Another one: the BFS validation hook flagged that I'd built the sharing feature before implementing validation—literally backwards. Saved me from shipping an editor that could create unsolvable puzzles.

---

## The Things Kiro Couldn't Fix

To be clear, Kiro didn't magically make me a better programmer. I still:
- Struggled with TypeScript errors I didn't understand
- Spent hours debugging isometric math that looked right on paper but was off by a few pixels
- Had to rewrite my Reddit API integration when I misunderstood how OAuth tokens work

The code itself was still hard. The bugs were still frustrating. But at least I wasn't creating NEW problems by building things in the wrong order or forgetting requirements.

---

## Would I Use This Again?

Absolutely, but not for everything.

**I'd use Kiro when:**
- Building something complex that I haven't done before
- Working on a deadline where I can't afford major rewrites
- Creating something other people might need to understand later

**I probably wouldn't use it for:**
- Quick prototypes where I'm just exploring ideas
- Simple features I've built a dozen times before
- Projects where requirements are going to change constantly anyway

---

## Final Results

As of Oct 29 (deadline day), I have:
- A working game with 7 complete scenes
- A level editor that lets players create and validate their own puzzles
- Reddit integration that actually works
- A backend with proper API endpoints
- Responsive design that looks okay on phones and desktop

It's not perfect. There are definitely bugs I haven't found yet. But it's DONE, it's functional, and I'm honestly proud of it.

Without Kiro's structured approach, I genuinely don't think I would've finished. I'd probably still be rewriting the editor for the third time.

---

## What I Learned (Beyond Kiro)

The biggest takeaway wasn't about any specific tool. It was realizing that planning—real, actual planning—isn't a waste of time even when you're racing a deadline. Maybe especially when you're racing a deadline.

I've spent my entire self-taught coding journey believing that "real programmers" just sit down and code, and planning is for people who overthink things. Turns out, that's backwards. Planning is how you avoid wasting time on code you'll have to throw away.

---

## Key Insight: Specs Prevent Code Drift

**The biggest win wasn't speed—it was alignment.**

### What is "Code Drift"?

When implementation diverges from original vision because:
- Requirements weren't written down → forgot what feature should do
- Architecture wasn't planned → made it up as I went
- No acceptance criteria → "done" was subjective

**Result:** Code that works, but doesn't match what you wanted

### How Kiro Prevented Drift

1. **Requirements stayed synced with implementation**
   - Every feature traceable back to a user story
   - If code didn't match spec, spec was updated (or code was wrong)

2. **Design doc was single source of truth**
   - Backend developer (me) and frontend developer (also me) couldn't disagree on API
   - TypeScript interfaces enforced design decisions

3. **Tasks linked back to user stories**
   - Completing TASK-20 meant US-07 was satisfied
   - No "wait, why did I build this?" moments

**Example:**

**Without Kiro:**
- Built sharing system
- Week later: "Why doesn't it validate levels first?"
- Refactor to add validation (2 hours)

**With Kiro:**
- Requirement US-07: "System SHALL validate level BEFORE sharing"
- Task-20 depends on Task-15 (validation)
- Built in correct order (0 refactors)

---

## For Other Non-Professional Developers

If you're like me—teaching yourself, working on side projects, maybe feeling a bit like an impostor—here's what I'd say:

The gap between "I can code" and "I can build complete projects" isn't more tutorials or fancier AI tools. It's having some kind of structure to work within.

Kiro gave me that structure. It might not be the right structure for everyone, but having SOME system for planning before coding made a huge difference for me.

Try it on one feature. If it helps, great. If it feels like busywork that's slowing you down, don't force it. But at least try planning something out before you code it.

---

## Final Thought

I'm writing this at 11:45 AM on deadline day (12 hours before cutoff). The submission form is open in another tab. I'm genuinely nervous about whether this is good enough, whether judges will see bugs I missed, whether I should've spent less time on features and more time polishing.

But I'm also weirdly proud that I actually finished something this ambitious. A month ago, I wouldn't have believed I could build a multiplayer puzzle game with a level editor and Reddit integration.

If Kiro's documentation system helped me do that, it's worth sharing.

---

**Project:** ASTROCAT - Reddit Puzzle Game  
**Repository:** https://github.com/pichichi7/astrocat-phaser  
**Live on Reddit:** https://www.reddit.com/r/astrocatapp_dev/comments/1of5ytu/astrocatapp/  
**Kiro Specs:** See `.kiro/` folder in the repo

If I win, great. If not, this workflow is mine to keep forever.

Thanks for reading.

---

## Advice for Other Developers

### When to Use Kiro

✅ **Use Kiro when:**
- Project >1,000 LOC
- Requirements aren't trivial
- Multiple features with dependencies
- Working solo (need discipline)
- Hackathon/deadline pressure (can't afford rework)

❌ **Don't use Kiro when:**
- Prototyping/exploration (rapid iteration needed)
- Simple scripts (<100 LOC)
- Requirements will change drastically (waste of spec time)

---

## Final Results

As of Oct 29 (deadline day), I have:
- A working game with 7 complete scenes
- A level editor that lets players create and validate their own puzzles
- Reddit integration that actually works
- A backend with proper API endpoints
- Responsive design that looks okay on phones and desktop

It's not perfect. There are definitely bugs I haven't found yet. But it's DONE, it's functional, and I'm honestly proud of it.

Without Kiro's structured approach, I genuinely don't think I would've finished. I'd probably still be rewriting the editor for the third time.

---

## Links & Resources

- **Repository:** https://github.com/pichichi7/astrocat-phaser
- **Live on Reddit:** https://www.reddit.com/r/astrocatapp_dev/comments/1of5ytu/astrocatapp/
- **Kiro Specs:** See `.kiro/` folder in the repo

---

Thanks for reading.

