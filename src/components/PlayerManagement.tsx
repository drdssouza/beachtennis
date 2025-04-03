import { useState } from "react";
import { Player, Team, TournamentFormat } from "../types";
import { Plus, Trash2, User, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface PlayerManagementProps {
  players: Player[];
  setPlayers: (players: Player[]) => void;
  format: TournamentFormat;
  teams?: Team[];
  setTeams?: (teams: Team[]) => void;
}

export function PlayerManagement({ 
  players, 
  setPlayers, 
  format, 
  teams = [], 
  setTeams = () => {} 
}: PlayerManagementProps) {
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayer1Name, setNewPlayer1Name] = useState("");
  const [newPlayer2Name, setNewPlayer2Name] = useState("");
  
  // Definir o número máximo de jogadores/equipes com base no formato
  const getMaxPlayers = () => {
    switch (format) {
      case 'super8': return 8;
      case 'super12': return 12;
      case 'tournament': return 66; // Limite máximo para torneio
      default: return 8;
    }
  };
  
  const requiredPlayers = format === 'tournament' ? 4 : format === 'super8' ? 8 : 12;
  const maxPlayers = getMaxPlayers();
  const maxTeams = Math.floor(maxPlayers / 2);
  
  const addPlayer = () => {
    if (!newPlayerName.trim()) {
      toast.error("Por favor, insira um nome para o jogador");
      return;
    }
    
    if (players.length >= maxPlayers) {
      toast.error(`Número máximo de jogadores (${maxPlayers}) atingido para o formato ${
        format === 'super8' 
          ? 'Super 8' 
          : format === 'super12' 
            ? 'Super 12' 
            : 'Torneio'
      }`);
      return;
    }
    
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: newPlayerName.trim()
    };
    
    setPlayers([...players, newPlayer]);
    setNewPlayerName("");
    toast.success(`Jogador ${newPlayerName} adicionado com sucesso!`);
  };
  
  const addTeam = () => {
    if (!newPlayer1Name.trim() || !newPlayer2Name.trim()) {
      toast.error("Por favor, insira os nomes de ambos os jogadores");
      return;
    }
    
    if (teams.length >= maxTeams) {
      toast.error(`Número máximo de duplas (${maxTeams}) atingido para o formato Torneio`);
      return;
    }
    
    const player1: Player = {
      id: crypto.randomUUID(),
      name: newPlayer1Name.trim()
    };
    
    const player2: Player = {
      id: crypto.randomUUID(),
      name: newPlayer2Name.trim()
    };
    
    const newTeam: Team = {
      id: crypto.randomUUID(),
      players: [player1, player2],
      name: `${player1.name} / ${player2.name}`
    };
    
    setTeams([...teams, newTeam]);
    setNewPlayer1Name("");
    setNewPlayer2Name("");
    toast.success(`Dupla ${newTeam.name} adicionada com sucesso!`);
  };
  
  const removePlayer = (id: string) => {
    setPlayers(players.filter(player => player.id !== id));
    toast.success("Jogador removido com sucesso!");
  };
  
  const removeTeam = (id: string) => {
    setTeams(teams.filter(team => team.id !== id));
    toast.success("Dupla removida com sucesso!");
  };
  
  if (format === 'tournament') {
    return (
      <div className="beach-card mt-6">
        <h2 className="text-xl font-bold mb-4 text-beach-darkGray">Duplas</h2>
        <p className="text-sm text-gray-600 mb-4">
          Adicione as duplas para o formato Torneio (mínimo 2, máximo {maxTeams} duplas)
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="player1" className="block text-sm font-medium mb-1">Jogador 1</label>
            <div className="relative">
              <Input
                id="player1"
                type="text"
                value={newPlayer1Name}
                onChange={(e) => setNewPlayer1Name(e.target.value)}
                placeholder="Nome do jogador 1"
                className="w-full"
              />
              <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>
          
          <div>
            <label htmlFor="player2" className="block text-sm font-medium mb-1">Jogador 2</label>
            <div className="relative">
              <Input
                id="player2"
                type="text"
                value={newPlayer2Name}
                onChange={(e) => setNewPlayer2Name(e.target.value)}
                placeholder="Nome do jogador 2"
                className="w-full"
              />
              <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>
        </div>
        
        <Button 
          onClick={addTeam}
          className="beach-button-accent w-full mb-4 flex items-center justify-center gap-2"
        >
          <Users className="h-5 w-5" />
          <span>Adicionar Dupla</span>
        </Button>
        
        <div className="bg-beach-lightGray rounded-lg p-2">
          <h3 className="font-semibold mb-2">Lista de Duplas ({teams.length}/{format === 'tournament' ? `2-${maxTeams}` : requiredPlayers / 2})</h3>
          
          {teams.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Nenhuma dupla adicionada
            </div>
          ) : (
            <ul className="space-y-2">
              {teams.map((team) => (
                <li 
                  key={team.id} 
                  className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm"
                >
                  <div>
                    <span className="font-medium">{team.name}</span>
                    <div className="text-xs text-gray-500">
                      {team.players[0].name} • {team.players[1].name}
                    </div>
                  </div>
                  <button 
                    onClick={() => removeTeam(team.id)}
                    className="text-beach-red hover:bg-red-50 rounded-full p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }
  
  // Formato Super 8 ou Super 12 (individual players)
  return (
    <div className="beach-card mt-6">
      <h2 className="text-xl font-bold mb-4 text-beach-darkGray">Jogadores</h2>
      <p className="text-sm text-gray-600 mb-4">
        {format === 'super8' 
          ? 'Adicione 8 jogadores para o formato Super 8' 
          : format === 'super12'
            ? 'Adicione 12 jogadores para o formato Super 12'
            : `Adicione de 4 a ${maxPlayers} jogadores para o formato Torneio`}
      </p>
      
      <div className="flex mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Nome do jogador"
            className="w-full p-2 pr-10 border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-beach-blue"
          />
          <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
        <button 
          onClick={addPlayer}
          className="beach-button-accent rounded-l-none"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      
      <div className="bg-beach-lightGray rounded-lg p-2">
        <h3 className="font-semibold mb-2">Lista de Jogadores ({players.length}/{format === 'tournament' ? `4-${maxPlayers}` : requiredPlayers})</h3>
        
        {players.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Nenhum jogador adicionado
          </div>
        ) : (
          <ul className="space-y-2">
            {players.map((player) => (
              <li 
                key={player.id} 
                className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm"
              >
                <span>{player.name}</span>
                <button 
                  onClick={() => removePlayer(player.id)}
                  className="text-beach-red hover:bg-red-50 rounded-full p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}