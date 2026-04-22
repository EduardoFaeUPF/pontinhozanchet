// Player types
export interface Player {
  id: string
  name: string
  gamesPlayed: number
  wins: number
  totalProfit: number
  totalLoss: number
  createdAt: string
}

// Game types
export interface Round {
  id: string
  points: number
  timestamp: string
}

export interface GamePlayer {
  playerId: string
  playerName: string
  rounds: Round[]
  purchases: number
  totalPoints: number
  isActive: boolean
  hasBurst: boolean
  batsCount: number
}

export interface Match {
  id: string
  players: GamePlayer[]
  entryValue: number
  totalPot: number
  totalPurchases: number
  commission: number
  prize: number
  winnerId: string | null
  winnerName: string | null
  status: 'active' | 'finished'
  isPaid: boolean
  startedAt: string
  finishedAt: string | null
}

// Calculate commission based on total value
export function calculateCommission(totalValue: number): number {
  if (totalValue < 150) return 0
  
  // Pattern: 150-240 → 20, 250-340 → 30, etc.
  // Each 100 increase → commission increases by 10
  const baseValue = 150
  const baseCommission = 20
  
  if (totalValue >= 150 && totalValue <= 240) return 20
  if (totalValue >= 250 && totalValue <= 340) return 30
  if (totalValue >= 350 && totalValue <= 440) return 40
  if (totalValue >= 450 && totalValue <= 540) return 50
  if (totalValue >= 550 && totalValue <= 640) return 60
  if (totalValue >= 650 && totalValue <= 740) return 70
  if (totalValue >= 750 && totalValue <= 840) return 80
  if (totalValue >= 850 && totalValue <= 940) return 90
  if (totalValue >= 950 && totalValue <= 1040) return 100
  
  // For values above 1040, continue the pattern
  const range = Math.floor((totalValue - 50) / 100)
  return Math.min(range * 10, 200) // Cap at 200 for very high values
}

// Get highest score among active players (excluding a specific player)
export function getHighestScore(players: GamePlayer[], excludePlayerId?: string): number {
  const activePlayers = players.filter(p => p.isActive && p.playerId !== excludePlayerId)
  if (activePlayers.length === 0) return 0
  return Math.max(...activePlayers.map(p => p.totalPoints))
}
