'use client'

import { useState, useMemo } from 'react'
import { Sidebar } from '@/components/sidebar'
import { useGame } from '@/lib/game-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Trophy, 
  Users, 
  DollarSign, 
  Calendar,
  Trash2,
  RefreshCcw,
  CheckCircle,
  Clock,
  Filter,
  History
} from 'lucide-react'

export default function HistoricoPage() {
  const { matchHistory, players, deleteMatch, markMatchPaid, startRematch } = useGame()
  const [filterPlayer, setFilterPlayer] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterDate, setFilterDate] = useState('')

  const filteredMatches = useMemo(() => {
    return matchHistory.filter(match => {
      // Filter by player
      if (filterPlayer !== 'all') {
        const hasPlayer = match.players.some(p => p.playerId === filterPlayer)
        if (!hasPlayer) return false
      }

      // Filter by status
      if (filterStatus === 'paid' && !match.isPaid) return false
      if (filterStatus === 'pending' && match.isPaid) return false

      // Filter by date
      if (filterDate) {
        const matchDate = new Date(match.startedAt).toISOString().split('T')[0]
        if (matchDate !== filterDate) return false
      }

      return true
    })
  }, [matchHistory, filterPlayer, filterStatus, filterDate])

  const totalStats = useMemo(() => {
    return {
      totalMatches: matchHistory.length,
      totalPrize: matchHistory.reduce((sum, m) => sum + m.prize, 0),
      totalCommission: matchHistory.reduce((sum, m) => sum + m.commission, 0),
      paidMatches: matchHistory.filter(m => m.isPaid).length
    }
  }, [matchHistory])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Historico de Partidas</h1>
            <p className="text-muted-foreground mt-2">
              Visualize e gerencie todas as partidas anteriores
            </p>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-2">
                  <History className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Total Partidas</span>
                </div>
                <p className="text-2xl font-bold">{totalStats.totalMatches}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-accent" />
                  <span className="text-sm text-muted-foreground">Total Premios</span>
                </div>
                <p className="text-2xl font-bold text-primary">R$ {totalStats.totalPrize}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-muted-foreground">Total Comissoes</span>
                </div>
                <p className="text-2xl font-bold">R$ {totalStats.totalCommission}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Partidas Pagas</span>
                </div>
                <p className="text-2xl font-bold">
                  {totalStats.paidMatches} / {totalStats.totalMatches}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-card border-border mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="w-48">
                  <label className="text-sm text-muted-foreground mb-1 block">Jogador</label>
                  <Select value={filterPlayer} onValueChange={setFilterPlayer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os jogadores</SelectItem>
                      {players.map(player => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-48">
                  <label className="text-sm text-muted-foreground mb-1 block">Status</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="paid">Pagos</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-48">
                  <label className="text-sm text-muted-foreground mb-1 block">Data</label>
                  <Input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />
                </div>

                {(filterPlayer !== 'all' || filterStatus !== 'all' || filterDate) && (
                  <div className="flex items-end">
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        setFilterPlayer('all')
                        setFilterStatus('all')
                        setFilterDate('')
                      }}
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Matches List */}
          {filteredMatches.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {matchHistory.length === 0 
                    ? 'Nenhuma partida registrada ainda'
                    : 'Nenhuma partida encontrada com os filtros selecionados'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredMatches.map((match) => (
                <Card key={match.id} className="bg-card border-border">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Match Header */}
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-accent" />
                            <span className="font-semibold text-lg">
                              {match.winnerName || 'Sem vencedor'}
                            </span>
                          </div>
                          <span className={`
                            text-xs px-2 py-1 rounded-full
                            ${match.isPaid 
                              ? 'bg-primary/20 text-primary' 
                              : 'bg-accent/20 text-accent'}
                          `}>
                            {match.isPaid ? 'Pago' : 'Pendente'}
                          </span>
                        </div>

                        {/* Match Details */}
                        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{match.players.length} jogadores</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>Pote: R$ {match.totalPot}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>Comissao: R$ {match.commission}</span>
                          </div>
                          <div className="flex items-center gap-1 text-primary font-semibold">
                            <span>Premio: R$ {match.prize}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(match.startedAt).toLocaleDateString('pt-BR')} as{' '}
                              {new Date(match.startedAt).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Players List */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {match.players.map((player) => (
                            <span 
                              key={player.playerId}
                              className={`
                                text-xs px-2 py-1 rounded
                                ${player.playerId === match.winnerId 
                                  ? 'bg-primary/20 text-primary font-semibold' 
                                  : 'bg-secondary text-muted-foreground'}
                              `}
                            >
                              {player.playerName}
                              {player.purchases > 0 && ` (${player.purchases}x)`}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        {!match.isPaid && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => markMatchPaid(match.id)}
                            className="border-primary text-primary hover:bg-primary/10"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Marcar Pago
                          </Button>
                        )}

                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => startRematch(match.id)}
                        >
                          <RefreshCcw className="w-4 h-4 mr-1" />
                          Revanche
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Partida</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir esta partida? Esta acao nao pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteMatch(match.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
