export interface BoardModifier {
  from: number;
  to: number;
  type: 'ladder' | 'snake';
  label: string;
}

export interface SnakePlayer {
  id: string;
  name: string;
  avatar: string;
  position: number;
  isAi?: boolean;
}

export const DEFAULT_LADDERS: BoardModifier[] = [
  { from: 4, to: 25, type: 'ladder', label: 'Helped Nani fold all laundry' },
  { from: 12, to: 35, type: 'ladder', label: 'Completed school tuition homework before sunset' },
  { from: 22, to: 58, type: 'ladder', label: 'Helped Amma carry fresh vegetables from rythu bazaar' },
  { from: 41, to: 79, type: 'ladder', label: 'Aligned all footwear neatly on the shoe rack' },
  { from: 54, to: 88, type: 'ladder', label: 'Woke up at 6:30 AM for family morning beach walk' },
  { from: 70, to: 92, type: 'ladder', label: 'Turned off all balcony lights and saved electricity' }
];

export const DEFAULT_SNAKES: BoardModifier[] = [
  { from: 28, to: 10, type: 'snake', label: 'Forgot to fill dinner water bottles' },
  { from: 48, to: 16, type: 'snake', label: 'Left clean school uniform crumpled on bed' },
  { from: 66, to: 32, type: 'snake', label: 'Sneaked phone onto the sofa past 9:30 PM' },
  { from: 83, to: 45, type: 'snake', label: 'Argued with sibling over TV remote' },
  { from: 94, to: 64, type: 'snake', label: 'Forgot to water the balcony tulsi and flower pots' },
  { from: 99, to: 38, type: 'snake', label: 'Left dining table messy after evening snack' }
];

export function getModifierAtPosition(pos: number): BoardModifier | undefined {
  return (
    DEFAULT_LADDERS.find(l => l.from === pos) ||
    DEFAULT_SNAKES.find(s => s.from === pos)
  );
}

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function calculateNewPosition(
  currentPos: number,
  diceRoll: number
): { finalPos: number; modifier?: BoardModifier; won: boolean } {
  let target = currentPos + diceRoll;

  if (target > 100) {
    // Bounce back if overshoot
    const overflow = target - 100;
    target = 100 - overflow;
  }

  const modifier = getModifierAtPosition(target);
  const finalPos = modifier ? modifier.to : target;
  const won = finalPos === 100;

  return { finalPos, modifier, won };
}
