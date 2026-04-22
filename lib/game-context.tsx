'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { Player, Match, GamePlayer, Round, calculateCommission, getHighestScore } from './types'

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

  const addPlayer = useCallback((name: string) => {
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
  }, [])

  const updatePlayer = useCallback((id: string, updates: Partial<Player>) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }, [])

  const deletePlayer = useCallback((id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id))
  }, [])

  const startMatch = useCallback((playerIds: string[], entryValue: number) => {
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

    const newMatch: Match = {
      id: crypto.randomUUID(),
      players: gamePlayers,
      entryValue,
      totalPot,
      totalPurchases: 0,
      commission: calculateCommission(totalPot),
      prize: totalPot - calculateCommission(totalPot),
      winnerId: null,
      winnerName: null,
      status: 'active',
      isPaid: false,
      startedAt: new Date().toISOString(),
      finishedAt: null
    }

    playerIds.forEach(id => {
      const player = players.find(p => p.id === id)
      if (player) {
        updatePlayer(id, {
          gamesPlayed: player.gamesPlayed + 1,
          totalLoss: player.totalLoss + entryValue
        })
      }
    })

    setActiveMatch(newMatch)
  }, [players, updatePlayer])

  const recalculateMatchFinancials = useCallback((match: Match): Match => {
    const totalPurchases = match.players.reduce((sum, p) => sum + p.purchases, 0) * 10
    const totalPot = (match.entryValue * match.players.length) + totalPurchases
    const commission = calculateCommission(totalPot)
    const prize = totalPot - commission

    return {
      ...match,
      totalPurchases,
      totalPot,
      commission,
      prize
    }
  }, [])

  const finalizeMatchWithWinner = useCallback((match: Match, winner: GamePlayer): Match => {
    const winnerPlayer = players.find(p => p.id === winner.playerId)

    if (winnerPlayer) {
      updatePlayer(winner.playerId, {
        wins: winnerPlayer.wins + 1,
        totalProfit: winnerPlayer.totalProfit + match.prize
      })
    }

    return {
      ...match,
      winnerId: winner.playerId,
      winnerName: winner.playerName,
      status: 'finished',
      finishedAt: new Date().toISOString()
    }
  }, [players, updatePlayer])

  const checkGameEnd = useCallback((match: Match): Match => {
    const activePlayers = match.players.filter(p => p.isActive)

    if (activePlayers.length === 1) {
      return finalizeMatchWithWinner(match, activePlayers[0])
    }

    return match
  }, [finalizeMatchWithWinner])

  const addPoints = useCallback((playerId: string, points: number) => {
    if (!activeMatch) return

    setActiveMatch(prev => {
      if (!prev) return null

      const updatedPlayers = prev.players.map(p => {
        if (p.playerId !== playerId) return p

        const newRound: Round = {
          id: crypto.randomUUID(),
          points,
          timestamp: new Date().toISOString()
        }

        const newTotalPoints = p.totalPoints + points
        const hasBurst = newTotalPoints >= 100

        return {
          ...p,
          rounds: [...p.rounds, newRound],
          totalPoints: newTotalPoints,
          hasBurst
        }
      })

      return { ...prev, players: updatedPlayers }
    })
  }, [activeMatch])

  const removeRound = useCallback((playerId: string, roundId: string) => {
    if (!activeMatch) return

    setActiveMatch(prev => {
      if (!prev) return null

      const updatedPlayers = prev.players.map(p => {
        if (p.playerId !== playerId) return p

        const updatedRounds = p.rounds.filter(r => r.id !== roundId)
        const newTotalPoints = updatedRounds.reduce((sum, r) => sum + r.points, 0)
        const hasBurst = newTotalPoints >= 100

        return {
          ...p,
          rounds: updatedRounds,
          totalPoints: newTotalPoints,
          hasBurst
        }
      })

      return { ...prev, players: updatedPlayers }
    })
  }, [activeMatch])

  const playerBat = useCallback((playerId: string) => {
    if (!activeMatch) return

    setActiveMatch(prev => {
      if (!prev) return null

      const updatedPlayers = prev.players.map(p => {
        if (p.playerId !== playerId) return p
        return { ...p, batsCount: p.batsCount + 1 }
      })

      return { ...prev, players: updatedPlayers }
    })
  }, [activeMatch])

  const undoPlayerBat = useCallback((playerId: string) => {
    if (!activeMatch) return

    setActiveMatch(prev => {
      if (!prev) return null

      const updatedPlayers = prev.players.map(p => {
        if (p.playerId !== playerId) return p
        return { ...p, batsCount: Math.max(0, p.batsCount - 1) }
      })

      return { ...prev, players: updatedPlayers }
    })
  }, [activeMatch])

  const playerPurchase = useCallback((playerId: string) => {
    if (!activeMatch) return

    setActiveMatch(prev => {
      if (!prev) return null

      const highestScore = getHighestScore(prev.players, playerId)

      const updatedPlayers = prev.players.map(p => {
        if (p.playerId !== playerId) return p
        return {
          ...p,
          purchases: p.purchases + 1,
          totalPoints: highestScore,
          hasBurst: false,
          isActive: true
        }
      })

      let updatedMatch = { ...prev, players: updatedPlayers }
      updatedMatch = recalculateMatchFinancials(updatedMatch)

      const player = players.find(p => p.id === playerId)
      if (player) {
        updatePlayer(playerId, { totalLoss: player.totalLoss + 10 })
      }

      return updatedMatch
    })
  }, [activeMatch, players, updatePlayer, recalculateMatchFinancials])

  const eliminatePlayer = useCallback((playerId: string) => {
    if (!activeMatch) return

    setActiveMatch(prev => {
      if (!prev) return null

      const updatedPlayers = prev.players.map(p => {
        if (p.playerId !== playerId) return p
        return {
          ...p,
          isActive: false
        }
      })

      return { ...prev, players: updatedPlayers }
    })
  }, [activeMatch])

  const endMatch = useCallback(() => {
    if (!activeMatch) return

    let finishedMatch = checkGameEnd(activeMatch)

    if (finishedMatch.status !== 'finished') {
      const activePlayers = finishedMatch.players.filter(p => p.isActive)

      if (activePlayers.length > 0) {
        const forcedWinner = [...activePlayers].sort((a, b) => a.totalPoints - b.totalPoints)[0]
        finishedMatch = finalizeMatchWithWinner(finishedMatch, forcedWinner)
      }
    }

    if (finishedMatch.status === 'finished') {
      setMatchHistory(prev => [finishedMatch, ...prev])
      setActiveMatch(null)
    }
  }, [activeMatch, checkGameEnd, finalizeMatchWithWinner])

  const deleteMatch = useCallback((matchId: string) => {
    setMatchHistory(prev => prev.filter(m => m.id !== matchId))
  }, [])

  const markMatchPaid = useCallback((matchId: string) => {
    setMatchHistory(prev => prev.map(m =>
      m.id === matchId ? { ...m, isPaid: true } : m
    ))
  }, [])

  const startRematch = useCallback((matchId: string) => {
    const match = matchHistory.find(m => m.id === matchId)
    if (!match) return

    const playerIds = match.players.map(p => p.playerId)
    const validPlayerIds = playerIds.filter(id => players.some(p => p.id === id))

    if (validPlayerIds.length >= 2) {
      startMatch(validPlayerIds, match.entryValue)
    }
  }, [matchHistory, players, startMatch])

  return (
    <GameContext.Provider value={{
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
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}