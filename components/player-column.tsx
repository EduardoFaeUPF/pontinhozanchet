'use client'

import { useState } from 'react'
import { GamePlayer, getHighestScore } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Trash2, Plus, RefreshCcw, Zap, UserX, Coins, RotateCcw } from 'lucide-react'

interface PlayerColumnProps {
  player: GamePlayer
  allPlayers: GamePlayer[]
  onAddPoints: (points: number) => void
  onRemoveRound: (roundId: string) => void
  onBat: () => void
  onUndoBat: () => void
  onPurchase: () => void
  onEliminate: () => void
}

export function PlayerColumn({
  player,
  allPlayers,
  onAddPoints,
  onRemoveRound,
  onBat,
  onUndoBat,
  onPurchase,
  onEliminate
}: PlayerColumnProps) {
  const [isAddPointsOpen, setIsAddPointsOpen] = useState(false)
  const [pointsInput, setPointsInput] = useState('')

  const pointsRemaining = Math.max(0, 99 - player.totalPoints)
  const hasBurst = player.totalPoints >= 100
  const highestScore = getHighestScore(allPlayers, player.playerId)

  const handleAddPoints = () => {
    const points = parseInt(pointsInput)
    if (!isNaN(points) && points >= 0) {
      onAddPoints(points)
      setPointsInput('')
      setIsAddPointsOpen(false)
    }
  }

  const quickPoints = [0, 5, 10, 15, 20, 25, 30, 40, 50]

  return (
    <>
      <div
        className={[
          'relative flex flex-col overflow-hidden rounded-2xl border shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition-all duration-300',
          !player.isActive
            ? 'border-zinc-800 bg-zinc-950/60 opacity-60'
            : hasBurst
              ? 'border-red-500/60 bg-gradient-to-b from-[#2a0c0c] to-[#140707]'
              : 'border-yellow-500/20 bg-gradient-to-b from-[#0d2018] via-[#0a1712] to-[#07110d]'
        ].join(' ')}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.08),_transparent_30%)]" />

        <div
          className={[
            'relative border-b px-4 py-3 text-center',
            hasBurst
              ? 'border-red-500/40 bg-red-500/10'
              : 'border-yellow-500/15 bg-black/20'
          ].join(' ')}
        >
          <div className="mb-2 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-300/85">
            <Coins className="h-3.5 w-3.5" />
            Compras {player.purchases}
          </div>

          <h3 className="truncate text-lg font-bold tracking-wide text-yellow-100">
            {player.playerName}
          </h3>

          {player.batsCount > 0 && (
            <div className="mt-1 text-xs font-medium text-emerald-300">
              Batidas: {player.batsCount} (+R$ {player.batsCount * 10 * (allPlayers.length - 1)})
            </div>
          )}
        </div>

        <div className="relative flex-1 min-h-[240px] max-h-[340px] overflow-y-auto p-3">
          {player.rounds.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-yellow-500/10 bg-black/10 text-sm text-zinc-500">
              Sem pontos lançados
            </div>
          ) : (
            <div className="space-y-2">
              {player.rounds.map((round, index) => (
                <div
                  key={round.id}
                  className={[
                    'flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition-all',
                    round.points >= 30
                      ? 'border-red-500/40 bg-red-500/15 text-red-200'
                      : 'border-yellow-500/10 bg-black/20 text-zinc-100'
                  ].join(' ')}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    R{index + 1}
                  </span>

                  <span className={`text-base font-bold ${round.points >= 30 ? 'text-red-300' : 'text-yellow-50'}`}>
                    {round.points}
                  </span>

                  <button
                    onClick={() => onRemoveRound(round.id)}
                    className="rounded-md p-1 transition-colors hover:bg-red-500/15"
                    type="button"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-zinc-400 hover:text-red-300" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 border-t border-yellow-500/10 bg-black/20 p-3">
          {player.isActive && (
            <>
              <Button
                onClick={() => setIsAddPointsOpen(true)}
                className="w-full rounded-xl border border-yellow-400/20 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_0_18px_rgba(34,197,94,0.18)] hover:from-emerald-500 hover:to-emerald-400"
                size="sm"
              >
                <Plus className="mr-1 h-4 w-4" />
                + Pontos
              </Button>

              <Button
                onClick={onBat}
                variant="outline"
                className="w-full rounded-xl border-yellow-500/30 bg-yellow-500/5 text-yellow-200 hover:bg-yellow-500/10 hover:text-yellow-100"
                size="sm"
              >
                <Zap className="mr-1 h-4 w-4" />
                Bateu
              </Button>

              {player.batsCount > 0 && (
                <Button
                  onClick={onUndoBat}
                  variant="outline"
                  className="w-full rounded-xl border-zinc-500/40 bg-zinc-500/10 text-zinc-200 hover:bg-zinc-500/15"
                  size="sm"
                >
                  <RotateCcw className="mr-1 h-4 w-4" />
                  Desfazer Bateu
                </Button>
              )}
            </>
          )}

          {hasBurst && player.isActive && (
            <>
              <Button
                onClick={onPurchase}
                variant="outline"
                className="w-full rounded-xl border-emerald-400/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15 hover:text-emerald-200 animate-pulse"
                size="sm"
              >
                <RefreshCcw className="mr-1 h-4 w-4" />
                Voltar (R$10)
              </Button>

              <p className="text-center text-xs font-medium text-zinc-400">
                Voltará com <span className="font-bold text-yellow-300">{highestScore} pts</span>
              </p>

              <Button
                onClick={onEliminate}
                variant="outline"
                className="w-full rounded-xl border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/15 hover:text-red-200"
                size="sm"
              >
                <UserX className="mr-1 h-4 w-4" />
                Eliminar
              </Button>
            </>
          )}
        </div>

        <div
          className={[
            'border-t px-4 py-3',
            hasBurst
              ? 'border-red-500/40 bg-red-500/10'
              : 'border-yellow-500/15 bg-black/25'
          ].join(' ')}
        >
          <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
            <span>Resumo</span>
            <span>{hasBurst ? 'Status Crítico' : 'Na Mesa'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-center">
              <div className="text-[11px] uppercase tracking-[0.16em] text-emerald-300/80">Total</div>
              <div className="text-xl font-extrabold text-emerald-300">
                {player.totalPoints}
              </div>
            </div>

            <div
              className={[
                'rounded-xl border px-3 py-2 text-center',
                hasBurst
                  ? 'border-red-500/30 bg-red-500/10'
                  : 'border-yellow-500/20 bg-yellow-500/10'
              ].join(' ')}
            >
              <div className="text-[11px] uppercase tracking-[0.16em] text-yellow-200/80">
                {hasBurst ? 'Status' : 'Faltam'}
              </div>
              <div className={`text-sm font-bold ${hasBurst ? 'text-red-300' : 'text-yellow-200'}`}>
                {hasBurst ? 'ESTOUROU' : pointsRemaining}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isAddPointsOpen} onOpenChange={setIsAddPointsOpen}>
        <DialogContent className="max-w-sm border border-yellow-500/20 bg-[#08110d] text-white">
          <DialogHeader>
            <DialogTitle className="text-yellow-200">
              Adicionar Pontos - {player.playerName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Input
              type="number"
              placeholder="Pontos"
              value={pointsInput}
              onChange={(e) => setPointsInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPoints()}
              autoFocus
              className="h-14 border-yellow-500/20 bg-black/20 text-center text-2xl text-yellow-100"
              min={0}
            />

            <div className="grid grid-cols-3 gap-2">
              {quickPoints.map((pts) => (
                <Button
                  key={pts}
                  variant="outline"
                  onClick={() => {
                    onAddPoints(pts)
                    setIsAddPointsOpen(false)
                    setPointsInput('')
                  }}
                  className={
                    pts >= 30
                      ? 'border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/15'
                      : 'border-yellow-500/20 bg-black/10 text-yellow-100 hover:bg-yellow-500/10'
                  }
                >
                  {pts}
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddPointsOpen(false)}
              className="border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddPoints}
              disabled={!pointsInput}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400"
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}