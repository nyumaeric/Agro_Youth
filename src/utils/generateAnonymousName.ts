import { eq } from "drizzle-orm";
import db from "@/server/db/index";
import { users } from "@/server/db/schema";


export async function generateUniqueAnonymousName(): Promise<string> {
  const patterns = [
    {
      adjectives: ["Silent", "Brave", "Swift", "Calm", "Bold", "Wise", "Kind", "Sharp", "Quick", "Bright"],
      nouns: ["Eagle", "Lion", "Wolf", "Fox", "Owl", "Bear", "Tiger", "Hawk", "Raven", "Phoenix"]
    },
    {
      adjectives: ["Golden", "Silver", "Crystal", "Ruby", "Jade", "Diamond", "Amber", "Pearl", "Coral", "Opal"],
      nouns: ["Star", "Moon", "Sun", "Wave", "Stone", "Flame", "Gem", "Ray", "Glow", "Beam"]
    },
    {
      adjectives: ["Ocean", "Mountain", "Forest", "River", "Thunder", "Lightning", "Storm", "Wind", "Fire", "Earth"],
      nouns: ["Walker", "Rider", "Guardian", "Keeper", "Seeker", "Wanderer", "Hunter", "Warrior", "Spirit", "Soul"]
    }
  ];

  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    const adjective = pattern.adjectives[Math.floor(Math.random() * pattern.adjectives.length)];
    const noun = pattern.nouns[Math.floor(Math.random() * pattern.nouns.length)];
    
    let anonymousName: string;
    
    if (attempts < 50) {
      anonymousName = `${adjective}${noun}`;
    } else {
      const randomNum = Math.floor(Math.random() * 999) + 1;
      anonymousName = `${adjective}${noun}${randomNum}`;
    }

    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.anonymousName, anonymousName))
      .limit(1);

    if (existingUser.length === 0) {
      return anonymousName;
    }

    attempts++;
  }

  const timestamp = Date.now().toString().slice(-4);
  return `Anonymous${timestamp}`;
}


export async function generateAnonymousNameFromPattern(): Promise<string> {
  const namePatterns = [
    {
      consonants: ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Z'],
      vowels: ['a', 'e', 'i', 'o', 'u'],
      endings: ['Hunter', 'Walker', 'Rider', 'Keeper', 'Seeker', 'Guard', 'Spirit', 'Soul', 'Heart', 'Mind']
    }
  ];

  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const pattern = namePatterns[0]; 
    
    const c1 = pattern.consonants[Math.floor(Math.random() * pattern.consonants.length)];
    const v1 = pattern.vowels[Math.floor(Math.random() * pattern.vowels.length)];
    const c2 = pattern.consonants[Math.floor(Math.random() * pattern.consonants.length)];
    const v2 = pattern.vowels[Math.floor(Math.random() * pattern.vowels.length)];
    const ending = pattern.endings[Math.floor(Math.random() * pattern.endings.length)];
    
    let anonymousName = `${c1}${v1}${c2}${v2}${ending}`;
    
    if (attempts > 30) {
      const randomNum = Math.floor(Math.random() * 99) + 1;
      anonymousName += randomNum;
    }

    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.anonymousName, anonymousName))
      .limit(1);

    if (existingUser.length === 0) {
      return anonymousName;
    }

    attempts++;
  }

  const timestamp = Date.now().toString().slice(-4);
  return `User${timestamp}`;
}


export function generateAnonymousAvatar(): string {
  const avatarTypes = [
    'geometric', 'abstract', 'minimal', 'colorful', 'monochrome',
    'pattern', 'gradient', 'simple', 'modern', 'classic'
  ];
  
  const avatarColors = [
    'red', 'blue', 'green', 'purple', 'orange', 'pink', 'yellow', 'teal', 'indigo', 'gray'
  ];
  
  const type = avatarTypes[Math.floor(Math.random() * avatarTypes.length)];
  const color = avatarColors[Math.floor(Math.random() * avatarColors.length)];
  const variant = Math.floor(Math.random() * 10) + 1;
  
  return `${type}_${color}_${variant}`;
}