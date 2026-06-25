const moods = ["feral", "neon", "gremlin", "static", "glitch", "wobbly", "snide", "dream-dumb", "slick", "smutty", "rude", "velvet", "spicy", "chaotic"];
const transitions = ["tilt", "blink", "melt", "swerve", "shiver", "spin", "snap", "drift", "warp", "thump", "jolt", "squirm"];
const creatures = ["mango goblin", "yard oracle", "cursed pigeon", "desk goblin", "moon rat", "mood raccoon", "paper phantom", "keyboard shrimp", "velvet imp", "street sprite", "catty bot", "bruise clown"];
const verbs = ["haunts", "snickers at", "unfolds over", "jumps through", "throws crumbs at", "judges", "loops around", "spits glitter on", "licks", "heckles", "teases", "roasts"];
const objects = ["a red stapler", "a rubber crown", "a broken vending machine", "a haunted loafer", "a polite tornado", "a screaming salad", "a fake moon", "a suspicious banana", "a satin chain", "a velvet couch", "a neon whip", "a bad decision"];
const endings = ["because dignity left the building", "and that is somehow the whole point", "while nobody was looking", "like a bad idea with excellent lighting", "to prove the floor can blink", "for no reason except vibes", "because the universe misclicked", "and now the walls are laughing", "with a wink and a warning", "after the bass dropped"];
const tunnelStyles = ["after-dark", "cabaret", "glitch", "basement", "arcade", "midnight", "boudoir", "trash-kingdom", "signal", "riot"];
const layoutModes = ["stack", "split", "capsule", "fan", "panel", "grid"];
const botVoices = ["sarcastic", "teasing", "smug", "gravelly", "dramatic", "deadpan"];
const gameKinds = ["warp-runner", "button-duel", "memory-madness", "blink-match", "noise-seeker", "coin-tilt"];
const soundSets = ["sizzle", "thump", "crackle", "pop", "buzz", "squeal", "clap", "slam"];

function pick(list, index, offset = 0) {
  return list[(index + offset) % list.length];
}

function slug(index) {
  return `hole-${String(index + 1).padStart(3, "0")}`;
}

export const rabbitHoles = Array.from({ length: 200 }, (_, index) => {
  const mood = pick(moods, index, index % 3);
  const transition = pick(transitions, index, index % 5);
  const creature = pick(creatures, index, Math.floor(index / 2));
  const verb = pick(verbs, index, Math.floor(index / 4));
  const object = pick(objects, index, Math.floor(index / 6));
  const ending = pick(endings, index, Math.floor(index / 7));
  const tunnelStyle = pick(tunnelStyles, index, Math.floor(index / 3));
  const botVoice = pick(botVoices, index, Math.floor(index / 5));
  const gameKind = pick(gameKinds, index, Math.floor(index / 4));
  const soundSet = pick(soundSets, index, Math.floor(index / 6));
  const layoutMode = pick(layoutModes, index, Math.floor(index / 8));
  const hue = (index * 27 + 40) % 360;
  const accent = (hue + 145) % 360;
  const moodIntensity = index % 4 === 0 ? "hard-rim" : index % 4 === 1 ? "slow-burn" : index % 4 === 2 ? "mean-glow" : "wild-card";
  const scare = index % 10 === 0 || index % 17 === 0;
  const adult = index % 3 === 0;

  return {
    id: index + 1,
    slug: slug(index),
    title: `${creature} ${verb} ${object}`,
    hook: `Tap to fall into a ${mood} ${tunnelStyle} tunnel with a ${transition} transition.`,
    opening: `Page ${index + 1} starts with ${object.toLowerCase()} and ends with ${creature} energy.`,
    punchline: `The ${creature} ${verb} ${object} ${ending}.`,
    prompt: `Click the next cursed door if you want the nonsense to get worse.`,
    transition,
    tunnelStyle,
    botVoice,
    gameKind,
    soundSet,
    layoutMode,
    scare,
    adult,
    moodIntensity,
    theme: {
      hue,
      accent,
      surface: `hsl(${hue} 35% 8%)`,
      glow: `hsla(${accent} 100% 70% / 0.36)`,
      card: `hsla(${hue} 60% 18% / 0.84)`,
      line: `hsla(${accent} 100% 78% / 0.22)`,
    },
    labels: [
      `${mood} warning`,
      `level ${String(index + 1).padStart(3, "0")}`,
      transition,
    ],
    crumbs: [
      `${creature} fact: nobody invited it.`,
      `Object of shame: ${object}.`,
      `Tone: ${mood}, but worse.`,
    ],
    oddities: [
      `${creature} ${verb} the air like it owes money.`,
      `The room forgets itself for a second.`,
      `Somewhere, a button becomes a question.`,
    ],
    cta: `Open the ${transition} door`,
    adultCue: adult ? `After-dark energy: ${tunnelStyle}.` : `Trouble level: ${moodIntensity}.`,
    botLine: `${botVoice} bot says the ${soundSet} signal is live.`,
    gameLine: `${gameKind} gets weird on this page.`,
    layoutLine: `${layoutMode} layout keeps page ${index + 1} visually distinct.`,
  };
});

export function getRabbitHoleBySlug(slugValue) {
  return rabbitHoles.find((entry) => entry.slug === slugValue) ?? rabbitHoles[0];
}
