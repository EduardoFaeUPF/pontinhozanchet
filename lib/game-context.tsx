'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { Player, Match, GamePlayer, Round, getHighestScore } from './types'

interface GameContextType {
  players: Player[]
  addPlayer: (name: string) => void
  updatePlayer: (id: string, updates: Partial<Player>) => void
  deletePlayer: (id: string) => void

  activeMatch: Match | null
  matchHistory: Match[]
  startMatch: (playerIds: string[], entryValue: number) => void
  endMatch: () => void

  addPoints: (playerId: string, points: number) => void
  removeRound: (playerId: string, roundId: string) => void
  playerBat: (playerId: string) => void
  undoPlayerBat: (playerId: string) => void
  playerPurchase: (playerId: string) => void
  removePurchase: (playerId: string) => void
  eliminatePlayer: (playerId: string) => void

  deleteMatch: (matchId: string) => void
  markMatchPaid: (matchId: string) => void
  startRematch: (matchId: string) => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

const STORAGE_KEYS = {
  players: 'pontinho_players',
  activeMatch: 'pontinho_active_match',
  matchHistory: 'pontinho_match_history'
}

// 🔥 COMISSÃO CORRIGIDA
function calculateCommission(total: number) {
  if (total < 60) return 0

  if (total < 150) return 10

  const faixa = Math.floor((total - 150) / 100)
  const comissao = (faixa + 2) * 10

  return Math.min(comissao, 130)
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([])
  const [activeMatch, setActiveMatch] = useState<Match | null>(null)
  const [matchHistory, setMatchHistory] = useState<Match[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedPlayers = localStorage.getItem(STORAGE_KEYS.players)
    const savedMatch = localStorage.getItem(STORAGE_KEYS.activeMatch)
    const savedHistory = localStorage.getItem(STORAGE_KEYS.matchHistory)

    if (savedPlayers) setPlayers(JSON.parse(savedPlayers))
    if (savedMatch) setActiveMatch(JSON.parse(savedMatch))
    if (savedHistory) setMatchHistory(JSON.parse(savedHistory))

    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem(STORAGE_KEYS.players, JSON.stringify(players))
  }, [players, isLoaded])

  useEffect(() => {
    if (!isLoaded) return
    if (activeMatch) {
      localStorage.setItem(STORAGE_KEYS.activeMatch, JSON.stringify(activeMatch))
    } else {
      localStorage.removeItem(STORAGE_KEYS.activeMatch)
    }
  }, [activeMatch, isLoaded])

  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem(STORAGE_KEYS.matchHistory, JSON.stringify(matchHistory))
  }, [matchHistory, isLoaded])

  // ---------------- PLAYERS ----------------

  const addPlayer = (name: string) => {
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name,
      gamesPlayed: 0,
      wins: 0,
      totalProfit: 0,
      totalLoss: 0,
      createdAt: new Date().toISOString()
    }
    setPlayers(prev => [...prev, newPlayer])
  }

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const deletePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id))
  }

  // ---------------- MATCH ----------------

  const recalcFinancial = (match: Match): Match => {
    const totalPlayers = match.players.length
    const totalPurchases = match.players.reduce((s, p) => s + p.purchases, 0) * 10

    const totalPot = (match.entryValue * totalPlayers) + totalPurchases
    const commission = calculateCommission(totalPot)

    return {
      ...match,
      totalPot,
      commission,
      prize: totalPot - commission
    }
  }

  const startMatch = (playerIds: string[], entryValue: number) => {
    const gamePlayers: GamePlayer[] = playerIds.map(id => {
      const player = players.find(p => p.id === id)
      return {
        playerId: id,
        playerName: player?.name || 'Unknown',
        rounds: [],
        purchases: 0,
        totalPoints: 0,
        isActive: true,
        hasBurst: false,
        batsCount: 0
      }
    })

    const totalPot = entryValue * playerIds.length
    const commission = calculateCommission(totalPot)

    const newMatch: Match = {
      id: crypto.randomUUID(),
      players: gamePlayers,
      entryValue,
      totalPot,
      totalPurchases: 0,
      commission,
      prize: totalPot - commission,
      winnerId: null,
      winnerName: null,
      status: 'active',
      isPaid: false,
      startedAt: new Date().toISOString(),
      finishedAt: null
    }

    setActiveMatch(newMatch)
  }

  const addPoints = (playerId: string, points: number) => {
    setActiveMatch(prev => {
      if (!prev) return null

      const clone = JSON.parse(JSON.stringify(prev))

      clone.players = clone.players.map((p: GamePlayer) => {
        if (p.playerId === playerId) {
          const newRound: Round = {
            id: crypto.randomUUID(),
            points,
            timestamp: new Date().toISOString()
          }

          p.rounds.push(newRound)
          p.totalPoints += points
          p.hasBurst = p.totalPoints >= 100
        }
        return p
      })

      return clone
    })
  }

  const playerBat = (playerId: string) => {
    setActiveMatch(prev => {
      if (!prev) return null

      const clone = JSON.parse(JSON.stringify(prev))

      clone.players = clone.players.map((p: GamePlayer) => {
        if (p.playerId === playerId) {
          p.batsCount += 1
        }
        return p
      })

      return clone
    })
  }

  const undoPlayerBat = (playerId: string) => {
    setActiveMatch(prev => {
      if (!prev) return null

      const clone = JSON.parse(JSON.stringify(prev))

      clone.players = clone.players.map((p: GamePlayer) => {
        if (p.playerId === playerId) {
          p.batsCount = Math.max(0, p.batsCount - 1)
        }
        return p
      })

      return clone
    })
  }

  // 🔥 COMPRA CORRIGIDA (BUG RESOLVIDO)
  const playerPurchase = (playerId: string) => {
    setActiveMatch(prev => {
      if (!prev) return null

      const clone = JSON.parse(JSON.stringify(prev))

      const safePlayers = clone.players.filter(
        (p: GamePlayer) => p.totalPoints < 100
      )

      let returnPoints = 0

      if (safePlayers.length > 0) {
        returnPoints = Math.max(...safePlayers.map((p: GamePlayer) => p.totalPoints))
      } else {
        returnPoints = 0
      }

      clone.players = clone.players.map((p: GamePlayer) => {
        if (p.playerId === playerId) {
          p.purchases += 1
          p.totalPoints = returnPoints
          p.hasBurst = false
          p.isActive = true
        }
        return p
      })

      return recalcFinancial(clone)
    })
  }

const removePurchase = (playerId: string) => {
  setActiveMatch(prev => {
    if (!prev) return prev

    return {
      ...prev,
      players: prev.players.map(p => {
        if (p.playerId !== playerId) return p

        return {
          ...p,
          purchases: Math.max(p.purchases - 1, 0)
        }
      })
    }
  })
}

const removeRound = (playerId: string, roundId: string) => {
  setActiveMatch(prev => {
    if (!prev) return null

    const clone = JSON.parse(JSON.stringify(prev))

    clone.players = clone.players.map((p: GamePlayer) => {
      if (p.playerId === playerId) {
        p.rounds = p.rounds.filter((round: Round) => round.id !== roundId)
        p.totalPoints = p.rounds.reduce((sum: number, round: Round) => sum + round.points, 0)
        p.hasBurst = p.totalPoints >= 100
      }
      return p
    })

    return clone
  })
}

  const eliminatePlayer = (playerId: string) => {
    setActiveMatch(prev => {
      if (!prev) return null

      const clone = JSON.parse(JSON.stringify(prev))

      clone.players = clone.players.map((p: GamePlayer) => {
        if (p.playerId === playerId) {
          p.isActive = false
        }
        return p
      })

      return clone
    })
  }

  const endMatch = () => {
    if (!activeMatch) return

    const activePlayers = activeMatch.players.filter(p => p.isActive)
    if (activePlayers.length === 0) return

    const winner = [...activePlayers].sort((a, b) => a.totalPoints - b.totalPoints)[0]

    const finished: Match = {
      ...activeMatch,
      winnerId: winner.playerId,
      winnerName: winner.playerName,
      status: 'finished',
      finishedAt: new Date().toISOString()
    }

    setMatchHistory(prev => [finished, ...prev])
    setActiveMatch(null)
  }

  // ---------------- HISTORY ACTIONS ----------------

  const deleteMatch = (matchId: string) => {
    setMatchHistory(prev => prev.filter(match => match.id !== matchId))
  }

  const markMatchPaid = (matchId: string) => {
    setMatchHistory(prev =>
      prev.map(match =>
        match.id === matchId
          ? { ...match, isPaid: true }
          : match
      )
    )
  }

  const startRematch = (matchId: string) => {
    const match = matchHistory.find(match => match.id === matchId)
    if (!match) return

    const validPlayerIds = match.players
      .map(player => player.playerId)
      .filter(playerId => players.some(player => player.id === playerId))

    if (validPlayerIds.length > 0) {
      startMatch(validPlayerIds, match.entryValue)
    }
  }

  return (
    <GameContext.Provider
      value={{
        players,
        addPlayer,
        updatePlayer,
        deletePlayer,
        activeMatch,
        matchHistory,
        startMatch,
        endMatch,
        addPoints,
        removeRound,
        playerBat,
        undoPlayerBat,
        playerPurchase,
        eliminatePlayer,
        deleteMatch,
        markMatchPaid,
        startRematch
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used dentro do GameProvider')
  return context
}