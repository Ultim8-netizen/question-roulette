export type Question = {
  text: string
  tier: 'light' | 'medium' | 'deep' | 'spicy'
}

export const QUESTIONS: Question[] = [
  { text: "What's the most embarrassing song on your current playlist?", tier: 'light' },
  { text: "What's a skill you have that would genuinely surprise people?", tier: 'light' },
  { text: "What's something you're weirdly competitive about?", tier: 'light' },
  { text: "If you had to eat one meal for the rest of your life, no consequences... what is it?", tier: 'light' },
  { text: "What's the worst advice you've ever followed?", tier: 'light' },
  { text: "What's a completely useless thing you know that you're somehow proud of?", tier: 'light' },
  { text: "What do people almost always misread about you?", tier: 'medium' },
  { text: "What do you need from people that you almost never actually ask for?", tier: 'medium' },
  { text: "What's a version of yourself you've grown out of but still kind of miss?", tier: 'medium' },
  { text: "What do you do when no one's watching that would confuse people?", tier: 'medium' },
  { text: "What's something you believe that most people around you don't?", tier: 'medium' },
  { text: "What's something you're secretly proud of that nobody would find impressive?", tier: 'medium' },
  { text: "Is there a version of your life that almost happened that you still think about?", tier: 'deep' },
  { text: "What's something you know you want but are afraid to actually pursue?", tier: 'deep' },
  { text: "What's the last thing that genuinely moved you... like actually moved you?", tier: 'deep' },
  { text: "What's something you've never said out loud but would feel relieved to?", tier: 'deep' },
  { text: "What does the version of you that's fully at peace look like?", tier: 'deep' },
  { text: "What's something you keep forgiving yourself for but haven't fully let go?", tier: 'deep' },
  { text: "Do you prefer to lead or follow?", tier: 'medium' },
  { text: "How long does it take before you're fully comfortable letting someone in?", tier: 'medium' },
  { text: "Are you the type to make the first move... or do you wait?", tier: 'medium' },
  { text: "What's something you're into that you don't usually bring up?", tier: 'medium' },
  { text: "Do you think you give more than you receive... or the other way around?", tier: 'medium' },
  { text: "How do you know when you're really into someone?", tier: 'medium' },
  { text: "Are you a giver or a taker?", tier: 'medium' },
  { text: "What's the dirtiest thought you've had about someone you probably shouldn't have?", tier: 'spicy' },
  { text: "What's something you've fantasised about but never had the nerve to ask for?", tier: 'spicy' },
  { text: "How loud do you get?", tier: 'spicy' },
  { text: "What's the most turned on you've ever been without anything actually happening?", tier: 'spicy' },
  { text: "What would you want someone to do to you that you've never asked for?", tier: 'spicy' },
  { text: "What's a sexual fantasy you've never told anyone?", tier: 'spicy' },
  { text: "What's the boldest move you've ever made on someone... and did it work?", tier: 'spicy' },
]