import { useState } from "react";
import { Match } from "../types";
import { Check, Plus, Minus, Edit } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface MatchCardProps {
  match: Match;
  onMatchUpdate: (updatedMatch: Match) => void;
}

export function MatchCard({ match, onMatchUpdate }: MatchCardProps) {
  const [score1, setScore1] = useState(match.score1);
  const [score2, setScore2] = useState(match.score2);
  const [isEditing, setIsEditing] = useState(!match.completed);
  
  const updateScore = (team: 1 | 2, increment: boolean) => {
    if (team === 1) {
      const newScore = increment ? score1 + 1 : Math.max(0, score1 - 1);
      setScore1(newScore);
    } else {
      const newScore = increment ? score2 + 1 : Math.max(0, score2 - 1);
      setScore2(newScore);
    }
  };
  
  const saveMatch = () => {
    const updatedMatch: Match = {
      ...match,
      score1,
      score2,
      completed: true
    };
    
    onMatchUpdate(updatedMatch);
    setIsEditing(false);
    toast.success("Partida finalizada com sucesso!");
  };
  
  const editMatch = () => {
    setIsEditing(true);
  };
  
  return (
    <div className="w-full bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <div className="grid grid-cols-12 gap-6 items-center">
        {/* Team 1 */}
        <div className="col-span-4">
          <div className="font-bold mb-2 text-beach-blue text-lg">Equipe 1</div>
          {match.team1.map((player, index) => (
            <div key={player.id} className="px-4 py-2 bg-gray-50 rounded-lg mb-2 border-l-4 border-beach-blue">
              <div className="text-sm font-medium">{player.name}</div>
            </div>
          ))}
        </div>
        
        {/* Score */}
        <div className="col-span-4 flex justify-center items-center bg-gray-50 py-4 rounded-xl">
          <div className={`text-4xl font-bold ${match.completed && !isEditing ? (score1 > score2 ? 'text-beach-green' : score1 < score2 ? 'text-beach-red' : 'text-beach-darkGray') : 'text-beach-darkGray'}`}>
            {score1}
          </div>
          <div className="mx-3 text-2xl font-light text-gray-400">:</div>
          <div className={`text-4xl font-bold ${match.completed && !isEditing ? (score2 > score1 ? 'text-beach-green' : score2 < score1 ? 'text-beach-red' : 'text-beach-darkGray') : 'text-beach-darkGray'}`}>
            {score2}
          </div>
        </div>
        
        {/* Team 2 */}
        <div className="col-span-4">
          <div className="font-bold mb-2 text-beach-orange text-lg text-right">Equipe 2</div>
          {match.team2.map((player, index) => (
            <div key={player.id} className="px-4 py-2 bg-gray-50 rounded-lg mb-2 border-r-4 border-beach-orange text-right">
              <div className="text-sm font-medium">{player.name}</div>
            </div>
          ))}
        </div>
      </div>
      
      {isEditing ? (
        <div className="mt-6">
          <div className="grid grid-cols-12 gap-4">
            {/* Team 1 Score Controls */}
            <div className="col-span-4 flex justify-center space-x-4">
              <button 
                onClick={() => updateScore(1, false)}
                className="p-3 bg-beach-lightGray rounded-full hover:bg-gray-200 transition-colors"
              >
                <Minus className="h-5 w-5 text-beach-blue" />
              </button>
              <button 
                onClick={() => updateScore(1, true)}
                className="p-3 bg-beach-lightGray rounded-full hover:bg-gray-200 transition-colors"
              >
                <Plus className="h-5 w-5 text-beach-blue" />
              </button>
            </div>
            
            <div className="col-span-4 flex justify-center items-center">
              <Button 
                onClick={saveMatch}
                className="w-full py-6 bg-gradient-to-r from-beach-teal to-beach-blue hover:opacity-90 transition-all text-white flex justify-center items-center gap-2 rounded-full"
              >
                <Check className="h-5 w-5" />
                <span className="text-base">{match.completed ? "Atualizar" : "Salvar"}</span>
              </Button>
            </div>
            
            {/* Team 2 Score Controls */}
            <div className="col-span-4 flex justify-center space-x-4">
              <button 
                onClick={() => updateScore(2, false)}
                className="p-3 bg-beach-lightGray rounded-full hover:bg-gray-200 transition-colors"
              >
                <Minus className="h-5 w-5 text-beach-orange" />
              </button>
              <button 
                onClick={() => updateScore(2, true)}
                className="p-3 bg-beach-lightGray rounded-full hover:bg-gray-200 transition-colors"
              >
                <Plus className="h-5 w-5 text-beach-orange" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex justify-center">
          <Button 
            onClick={editMatch}
            variant="outline" 
            className="flex items-center gap-2 border-beach-orange text-beach-orange hover:bg-beach-orange/10 py-6 px-6"
          >
            <Edit className="h-5 w-5" />
            <span className="text-base">Editar Placar</span>
          </Button>
        </div>
      )}
      
      {match.completed && !isEditing && (
        <div className="mt-4 bg-gray-50 rounded-lg p-4 text-center">
          {score1 > score2 ? (
            <div className="text-beach-green font-medium text-lg">
              Vitória da Equipe 1
            </div>
          ) : score1 < score2 ? (
            <div className="text-beach-green font-medium text-lg">
              Vitória da Equipe 2
            </div>
          ) : (
            <div className="text-beach-darkGray font-medium text-lg">
              Empate
            </div>
          )}
        </div>
      )}
    </div>
  );
}
