'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { useGame } from '@/lib/game-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { calculateCommission } from '@/lib/types'
import { Users, DollarSign, Trophy, Play, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function NovaPartidaPage() {
  const { players, startMatch, activeMatch } = useGame()
  const router = useRouter()
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [entryValue, setEntryValue] = useState(50)

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    )
  }

  const totalPot = entryValue * selectedPlayers.length
  const commission = calculateCommission(totalPot)
  const prize = totalPot - commission

  const handleStartMatch = () => {
    if (selectedPlayers.length >= 2) {
      startMatch(selectedPlayers, entryValue)
      router.push('/partida')
    }
  }

  if (activeMatch) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-2xl mx-auto text-center py-12">
            <AlertCircle className="w-16 h-16 text-accent mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Partida em Andamento</h1>
            <p className="text-muted-foreground mb-6">
              Ja existe uma partida ativa. Finalize a partida atual antes de iniciar uma nova.
            </p>
            <Link href="/partida">
              <Button size="lg">
                <Play className="w-5 h-5 mr-2" />
                Ir para Partida Ativa
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Nova Partida</h1>
            <p className="text-muted-foreground mt-2">
              Configure a partida selecionando os jogadores e o valor de entrada
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Player Selection */}
            <div className="lg:col-span-2">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Selecionar Jogadores
                  </CardTitle>
                  <CardDescription>
                    Escolha pelo menos 2 jogadores para iniciar a partida
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {players.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Nenhum jogador cadastrado
                      </p>
                      <Link href="/jogadores">
                        <Button variant="outline">
                          Cadastrar Jogadores
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {players.map((player) => {
                        const isSelected = selectedPlayers.includes(player.id)
                        return (
                          <div
                            key={player.id}
                            onClick={() => togglePlayer(player.id)}
                            className={`
                              flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all
                              border-2
                              ${isSelected 
                                ? 'border-primary bg-primary/10' 
                                : 'border-border bg-secondary/50 hover:border-muted-foreground'}
                            `}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => togglePlayer(player.id)}
                              className="pointer-events-none"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{player.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {player.wins} vitorias
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Config & Summary */}
            <div className="space-y-6">
              {/* Entry Value */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Valor de Entrada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">R$</span>
                    <Input
                      type="number"
                      min={1}
                      value={entryValue}
                      onChange={(e) => setEntryValue(Math.max(1, parseInt(e.target.value) || 0))}
                      className="text-lg font-semibold"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Resumo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Jogadores</span>
                    <span className="font-semibold">{selectedPlayers.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Pote Total</span>
                    <span className="font-semibold">R$ {totalPot}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Comissao</span>
                    <span className="font-semibold text-destructive">- R$ {commission}</span>
                  </div>
                  <hr className="border-border" />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Premio</span>
                    <span className="font-bold text-xl text-primary">R$ {prize}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Start Button */}
              <Button 
                onClick={handleStartMatch}
                disabled={selectedPlayers.length < 2}
                className="w-full h-14 text-lg"
                size="lg"
              >
                <Play className="w-6 h-6 mr-2" />
                Iniciar Partida
              </Button>

              {selectedPlayers.length < 2 && selectedPlayers.length > 0 && (
                <p className="text-sm text-center text-muted-foreground">
                  Selecione pelo menos 2 jogadores
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
