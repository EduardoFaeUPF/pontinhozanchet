'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { PlayerColumn } from '@/components/player-column'
import { useGame } from '@/lib/game-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

import {
  Users,
  DollarSign,
  Trophy,
  Percent,
  Award,
} from 'lucide-react'

export default function PartidaPage() {
  const {
    activeMatch,
    addPoints,
    removeRound,
    playerBat,
    undoPlayerBat,
    playerPurchase,
    eliminatePlayer,
    endMatch,
  } = useGame()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    setSidebarCollapsed(saved === 'true')
  }, [])

  const handleToggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev
      localStorage.setItem('sidebar-collapsed', String(next))
      return next
    })
  }

  if (!activeMatch) {
    return (
      <div className="flex min-h-screen">
        <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />

        <main
          className={cn(
            'flex-1 flex items-center justify-center',
            sidebarCollapsed ? 'ml-20' : 'ml-64'
          )}
        >
          <p className="text-xl text-muted-foreground">
            Nenhuma partida ativa
          </p>
        </main>
      </div>
    )
  }

  const activePlayers = activeMatch.players.filter(p => p.isActive)

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />

      <main
        className={cn(
          'flex-1 p-6 transition-all duration-300',
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        )}
      >
        {/* HEADER */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Partida em Andamento</h1>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="border-red-500 text-red-500">
                Encerrar Partida
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Encerrar partida?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja encerrar agora?
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={endMatch}>
                  Encerrar Mesmo Assim
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* DASHBOARD */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-400" />
                Jogadores
              </div>
              <p className="text-xl font-bold">
                {activePlayers.length}/{activeMatch.players.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                Pote
              </div>
              <p className="text-xl font-bold">
                R$ {activeMatch.totalPot}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-yellow-400" />
                Comissão
              </div>
              <p className="text-xl font-bold text-yellow-400">
                R$ {activeMatch.commission}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-green-400" />
                Prêmio
              </div>
              <p className="text-xl font-bold text-green-400">
                R$ {activeMatch.prize}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                Compras
              </div>
              <p className="text-xl font-bold">
                {activeMatch.players.reduce((s, p) => s + p.purchases, 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* JOGADORES */}
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {activeMatch.players.map((player) => (
              <div
                key={`${player.playerId}-${player.batsCount}-${player.totalPoints}`}
                className="w-[230px] shrink-0"
              >
                <PlayerColumn
                  player={player}
                  allPlayers={activeMatch.players}
                  onAddPoints={(points) => addPoints(player.playerId, points)}
                  onRemoveRound={(id) => removeRound(player.playerId, id)}
                  onBat={() => playerBat(player.playerId)}
                  onUndoBat={() => undoPlayerBat(player.playerId)}
                  onPurchase={() => playerPurchase(player.playerId)}
                  onEliminate={() => eliminatePlayer(player.playerId)}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}