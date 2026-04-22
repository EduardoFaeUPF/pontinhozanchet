'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { PlayerColumn } from '@/components/player-column'
import { useGame } from '@/lib/game-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Trophy,
  DollarSign,
  Users,
  AlertCircle,
  PlusCircle,
  Percent,
  Award,
  PartyPopper
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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
    matchHistory
  } = useGame()

  const router = useRouter()
  const [showWinnerDialog, setShowWinnerDialog] = useState(false)
  const [winner, setWinner] = useState<{ name: string; prize: number } | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    setSidebarCollapsed(saved === 'true')
  }, [])

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('sidebar-collapsed', String(next))
      return next
    })
  }

  useEffect(() => {
    if (activeMatch) {
      const activePlayers = activeMatch.players.filter((p) => p.isActive)
      const burstPlayers = activeMatch.players.filter((p) => p.hasBurst && p.isActive)

      if (activePlayers.length === 1 && burstPlayers.length === 0) {
        const winnerPlayer = activePlayers[0]
        setWinner({ name: winnerPlayer.playerName, prize: activeMatch.prize })
        setShowWinnerDialog(true)
      }
    }
  }, [activeMatch])

  useEffect(() => {
    if (!activeMatch && matchHistory.length > 0 && winner) {
      setTimeout(() => {
        router.push('/historico')
      }, 2000)
    }
  }, [activeMatch, matchHistory, winner, router])

  if (!activeMatch) {
    return (
      <div className="flex min-h-screen">
        <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />

        <main
          className={cn(
            'flex-1 p-8 transition-all duration-300',
            sidebarCollapsed ? 'ml-20' : 'ml-64'
          )}
        >
          <div className="mx-auto max-w-2xl py-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h1 className="mb-4 text-2xl font-bold">Nenhuma Partida Ativa</h1>
            <p className="mb-6 text-muted-foreground">
              Inicie uma nova partida para comecar a jogar.
            </p>
            <Link href="/nova-partida">
              <Button size="lg">
                <PlusCircle className="mr-2 h-5 w-5" />
                Nova Partida
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const activePlayers = activeMatch.players.filter((p) => p.isActive)

  const handleEndMatch = () => {
    if (activePlayers.length === 1) {
      endMatch()
    }
  }

  const handleForceEnd = () => {
    endMatch()
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />

      <main
        className={cn(
          'flex-1 p-6 transition-all duration-300',
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        )}
      >
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">Partida em Andamento</h1>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-destructive text-destructive">
                  Encerrar Partida
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Encerrar Partida?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {activePlayers.length > 1
                      ? `Ainda restam ${activePlayers.length} jogadores ativos. Tem certeza que deseja encerrar?`
                      : 'Deseja finalizar esta partida?'}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={activePlayers.length === 1 ? handleEndMatch : handleForceEnd}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {activePlayers.length === 1 ? 'Finalizar' : 'Encerrar Mesmo Assim'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Card className="bg-card border-border">
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Jogadores</span>
                </div>
                <p className="mt-1 text-xl font-bold">
                  {activePlayers.length} / {activeMatch.players.length}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Pote Total</span>
                </div>
                <p className="mt-1 text-xl font-bold">R$ {activeMatch.totalPot}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-yellow-300" />
                  <span className="text-sm text-muted-foreground">Comissao</span>
                </div>
                <p className="mt-1 text-xl font-bold text-yellow-300">
                  R$ {activeMatch.commission}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-accent" />
                  <span className="text-sm text-muted-foreground">Premio</span>
                </div>
                <p className="mt-1 text-xl font-bold text-primary">R$ {activeMatch.prize}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-accent" />
                  <span className="text-sm text-muted-foreground">Compras</span>
                </div>
                <p className="mt-1 text-xl font-bold">
                  {activeMatch.players.reduce((sum, p) => sum + p.purchases, 0)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="flex min-w-max gap-4">
            {activeMatch.players.map((player) => (
              <div key={player.playerId} className="w-[230px] shrink-0">
                <PlayerColumn
                  player={player}
                  allPlayers={activeMatch.players}
                  onAddPoints={(points) => addPoints(player.playerId, points)}
                  onRemoveRound={(roundId) => removeRound(player.playerId, roundId)}
                  onBat={() => playerBat(player.playerId)}
                  onUndoBat={() => undoPlayerBat(player.playerId)}
                  onPurchase={() => playerPurchase(player.playerId)}
                  onEliminate={() => eliminatePlayer(player.playerId)}
                />
              </div>
            ))}
          </div>
        </div>

        <Dialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
          <DialogContent className="text-center">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
                <PartyPopper className="h-8 w-8 text-accent" />
                Temos um Vencedor!
              </DialogTitle>

              <DialogDescription className="pt-4 text-lg">
                <span className="mb-2 block text-3xl font-bold text-primary">
                  {winner?.name}
                </span>
                <span className="block text-2xl text-accent">
                  Premio: R$ {winner?.prize}
                </span>
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-6">
              <Button
                onClick={() => {
                  setShowWinnerDialog(false)
                  handleEndMatch()
                }}
                className="w-full"
                size="lg"
              >
                Finalizar Partida
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}