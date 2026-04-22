'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { useGame } from '@/lib/game-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { PlusCircle, Pencil, Trash2, Trophy, TrendingUp, TrendingDown } from 'lucide-react'

export default function JogadoresPage() {
  const { players, addPlayer, updatePlayer, deletePlayer } = useGame()
  const [newPlayerName, setNewPlayerName] = useState('')
  const [editingPlayer, setEditingPlayer] = useState<{ id: string; name: string } | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      addPlayer(newPlayerName.trim())
      setNewPlayerName('')
      setIsAddDialogOpen(false)
    }
  }

  const handleUpdatePlayer = () => {
    if (editingPlayer && editingPlayer.name.trim()) {
      updatePlayer(editingPlayer.id, { name: editingPlayer.name.trim() })
      setEditingPlayer(null)
      setIsEditDialogOpen(false)
    }
  }

  const sortedPlayers = [...players].sort((a, b) => b.wins - a.wins)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Jogadores</h1>
              <p className="text-muted-foreground mt-2">
                Gerencie os jogadores cadastrados no sistema
              </p>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Novo Jogador
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Jogador</DialogTitle>
                  <DialogDescription>
                    Digite o nome do novo jogador
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="Nome do jogador"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddPlayer} disabled={!newPlayerName.trim()}>
                    Adicionar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Players List */}
          {players.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Nenhum jogador cadastrado ainda
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Cadastrar Primeiro Jogador
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedPlayers.map((player, index) => (
                <Card key={player.id} className="bg-card border-border">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Rank Badge */}
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                          ${index === 0 && player.wins > 0 ? 'bg-accent text-accent-foreground' : 
                            index === 1 && player.wins > 0 ? 'bg-muted text-foreground' :
                            index === 2 && player.wins > 0 ? 'bg-destructive/30 text-destructive' :
                            'bg-secondary text-secondary-foreground'}
                        `}>
                          {index + 1}
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-lg">{player.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {player.gamesPlayed} partidas jogadas
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-accent" />
                            <span className="font-medium">{player.wins} vitorias</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <span className="text-primary">+R$ {player.totalProfit}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-destructive" />
                            <span className="text-destructive">-R$ {player.totalLoss}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Dialog open={isEditDialogOpen && editingPlayer?.id === player.id} onOpenChange={(open) => {
                            setIsEditDialogOpen(open)
                            if (!open) setEditingPlayer(null)
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setEditingPlayer({ id: player.id, name: player.name })}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Editar Jogador</DialogTitle>
                                <DialogDescription>
                                  Altere o nome do jogador
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <Input
                                  placeholder="Nome do jogador"
                                  value={editingPlayer?.name || ''}
                                  onChange={(e) => setEditingPlayer(prev => 
                                    prev ? { ...prev, name: e.target.value } : null
                                  )}
                                  onKeyDown={(e) => e.key === 'Enter' && handleUpdatePlayer()}
                                  autoFocus
                                />
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => {
                                  setIsEditDialogOpen(false)
                                  setEditingPlayer(null)
                                }}>
                                  Cancelar
                                </Button>
                                <Button onClick={handleUpdatePlayer}>
                                  Salvar
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Jogador</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir {player.name}? Esta acao nao pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deletePlayer(player.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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
