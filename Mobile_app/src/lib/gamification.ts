export interface LevelInfo {
  level: number;
  xpInLevel: number;
  xpTarget: number;
  progress: number;
  totalXp: number;
  rankTitle: string;
}

const XP_BASE = 500;

export const calculateLevel = (totalXp: number): LevelInfo => {
  let level = 1;
  let xpForNextLevel = XP_BASE;
  let accumulatedXp = 0;

  while (totalXp >= accumulatedXp + xpForNextLevel) {
    accumulatedXp += xpForNextLevel;
    level++;
    xpForNextLevel = level * XP_BASE;
  }

  const xpInLevel = totalXp - accumulatedXp;
  const progress = Math.min(100, (xpInLevel / xpForNextLevel) * 100);

  return {
    level,
    xpInLevel,
    xpTarget: xpForNextLevel,
    progress,
    totalXp,
    rankTitle: getRankTitle(level)
  };
};

export const getRankTitle = (level: number): string => {
  if (level >= 50) return "CAFE SOVEREIGN";
  if (level >= 40) return "CAMPUS LEGEND";
  if (level >= 30) return "CAFE CONNOISSEUR";
  if (level >= 20) return "DEAN'S LIST DINER";
  if (level >= 15) return "GOURMET SCHOLAR";
  if (level >= 10) return "SAVVY STUDENT";
  if (level >= 5) return "REGULAR DINER";
  return "CAFE EXPLORER";
};

export const XP_REWARDS = {
  LOG_MEAL: 20,
  DAILY_CHECKIN: 10,
  COMPLETE_TASK: 50,
  BUDGET_MET: 100
};

export const calculateXpForLevelJump = (currentXp: number, jumps: number): number => {
  const current = calculateLevel(currentXp);
  const targetLevel = current.level + jumps;
  
  let targetTotalXp = 0;
  let level = 1;
  while (level < targetLevel) {
    targetTotalXp += level * XP_BASE;
    level++;
  }
  
  return Math.max(0, targetTotalXp - currentXp);
};
