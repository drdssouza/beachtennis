import { useState } from "react";
import { Player, TournamentFormat } from "../types";
import { Plus, Trash2, User } from "lucide-react";
import { toast } from "sonner";

interface PlayerManagementProps {
  players: Player[];
  setPlayers: (players: Player[]) => void;
  format: TournamentFormat;
}

export function PlayerManagement({ players, setPlayers, format }: PlayerManagementProps) {
  const [newPlayerName, setNewPlayerName] = useState("");
  
  const requiredPlayers = format === 'super8' ? 8 : 12;
  
  const addPlayer = () => {
    if (!newPlayerName.trim()) {
      toast.error("Por favor, insira um nome para o jogador");
      return;
    }
    
    if (players.length >= requiredPlayers) {
      toast.error(`Número máximo de jogadores (${requiredPlayers}) atingido para o formato ${format === 'super8' ? 'Super 8' : 'Super 12'}`);
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
  
  const removePlayer = (id: string) => {
    setPlayers(players.filter(player => player.id !== id));
    toast.success("Jogador removido com sucesso!");
  };
  
  return (
    <div className="beach-card mt-6">
      <h2 className="text-xl font-bold mb-4 text-beach-darkGray">Jogadores</h2>
      <p className="text-sm text-gray-600 mb-4">
        {format === 'super8' 
          ? 'Adicione 8 jogadores para o formato Super 8' 
          : 'Adicione 12 jogadores para o formato Super 12'}
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
        <h3 className="font-semibold mb-2">Lista de Jogadores ({players.length}/{requiredPlayers})</h3>
        
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