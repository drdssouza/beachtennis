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
    <div className="beach-card card-gradient animate-fade overflow-hidden">
      <div className="bg-gradient-to-r from-beach-blue to-beach-teal text-white p-4 -mx-6 -mt-6 mb-6 font-semibold text-center">
        <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm mb-1">Rodada {match.round}</span>
        <div>Partida {match.id.slice(0, 4)}</div>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="col-span-1 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="font-bold mb-1 text-beach-blue">Equipe 1</div>
              <div className="px-3 py-1 bg-gray-50 rounded-lg w-full">
                <div className="text-sm font-medium">{match.team1[0].name}</div>
              </div>
              <div className="px-3 py-1 bg-gray-50 rounded-lg w-full">
                <div className="text-sm font-medium">{match.team1[1].name}</div>
              </div>
            </div>
          </div>
          
          <div className="col-span-1 flex justify-center items-center">
            <div className={`text-3xl font-bold ${match.completed && !isEditing ? (score1 > score2 ? 'text-beach-green' : score1 < score2 ? 'text-beach-red' : 'text-beach-darkGray') : 'text-beach-darkGray'}`}>
              {score1}
            </div>
            <div className="mx-2 text-xl">:</div>
            <div className={`text-3xl font-bold ${match.completed && !isEditing ? (score2 > score1 ? 'text-beach-green' : score2 < score1 ? 'text-beach-red' : 'text-beach-darkGray') : 'text-beach-darkGray'}`}>
              {score2}
            </div>
          </div>
          
          <div className="col-span-1 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="font-bold mb-1 text-beach-orange">Equipe 2</div>
              <div className="px-3 py-1 bg-gray-50 rounded-lg w-full">
                <div className="text-sm font-medium">{match.team2[0].name}</div>
              </div>
              <div className="px-3 py-1 bg-gray-50 rounded-lg w-full">
                <div className="text-sm font-medium">{match.team2[1].name}</div>
              </div>
            </div>
          </div>
        </div>
        
        {isEditing ? (
          <>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="flex flex-col items-center space-y-3">
                <button 
                  onClick={() => updateScore(1, true)}
                  className="p-2 bg-beach-lightGray rounded-full hover:bg-gray-200 transition-colors"
                >
                  <Plus className="h-5 w-5 text-beach-blue" />
                </button>
                <button 
                  onClick={() => updateScore(1, false)}
                  className="p-2 bg-beach-lightGray rounded-full hover:bg-gray-200 transition-colors"
                >
                  <Minus className="h-5 w-5 text-beach-blue" />
                </button>
              </div>
              
              <div></div>
              
              <div className="flex flex-col items-center space-y-3">
                <button 
                  onClick={() => updateScore(2, true)}
                  className="p-2 bg-beach-lightGray rounded-full hover:bg-gray-200 transition-colors"
                >
                  <Plus className="h-5 w-5 text-beach-orange" />
                </button>
                <button 
                  onClick={() => updateScore(2, false)}
                  className="p-2 bg-beach-lightGray rounded-full hover:bg-gray-200 transition-colors"
                >
                  <Minus className="h-5 w-5 text-beach-orange" />
                </button>
              </div>
            </div>
            
            <Button 
              onClick={saveMatch}
              className="w-full bg-gradient-to-r from-beach-teal to-beach-blue hover:opacity-90 transition-all text-white flex justify-center items-center gap-2 rounded-full"
            >
              <Check className="h-5 w-5" />
              <span>{match.completed ? "Atualizar Placar" : "Finalizar Partida"}</span>
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            {match.completed && (
              <div className="bg-beach-lightGray rounded-lg p-3 text-center">
                {score1 > score2 ? (
                  <div className="text-beach-green font-medium">
                    Vitória da Equipe 1
                  </div>
                ) : score1 < score2 ? (
                  <div className="text-beach-green font-medium">
                    Vitória da Equipe 2
                  </div>
                ) : (
                  <div className="text-beach-darkGray font-medium">
                    Empate
                  </div>
                )}
              </div>
            )}
            
            <Button 
              onClick={editMatch}
              className="w-full bg-gradient-to-r from-beach-orange to-beach-coral hover:opacity-90 transition-all text-white flex justify-center items-center gap-2 rounded-full"
            >
              <Edit className="h-5 w-5" />
              <span>Editar Placar</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}