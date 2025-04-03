import React, { useState, useEffect } from "react";
import {
  SortingCriterion,
  loadSortingCriteria,
  saveSortingCriteria,
} from "../utils/storage_utils";
import { Settings, ArrowUpDown, Save } from "lucide-react";
import { toast } from "sonner";

interface SortingCriteriaSelectorProps {
  onCriteriaChange: (criteria: SortingCriterion[]) => void;
}

type CriterionOption = {
  value: SortingCriterion;
  label: string;
  description: string;
};

const criteriaOptions: CriterionOption[] = [
  {
    value: "wins",
    label: "Vitórias",
    description: "Número total de partidas vencidas",
  },
  {
    value: "gameBalance",
    label: "Saldo de Games",
    description: "Diferença entre games ganhos e perdidos",
  },
  {
    value: "totalGamesWon",
    label: "Games Ganhos",
    description: "Número total de games ganhos",
  },
  {
    value: "totalGamesLost",
    label: "Games Perdidos",
    description: "Menor quantidade de games perdidos (ordem inversa)",
  },
];

export function SortingCriteriaSelector({
  onCriteriaChange,
}: SortingCriteriaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [criteria, setCriteria] = useState<SortingCriterion[]>(
    loadSortingCriteria()
  );
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // Atualiza o componente pai quando os critérios mudam
  useEffect(() => {
    onCriteriaChange(criteria);
  }, [criteria, onCriteriaChange]);

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null) return;

    if (draggedItem !== index) {
      const newCriteria = [...criteria];
      const item = newCriteria[draggedItem];

      // Remove o item da posição atual
      newCriteria.splice(draggedItem, 1);
      // Insere na nova posição
      newCriteria.splice(index, 0, item);

      setCriteria(newCriteria);
      setDraggedItem(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const saveCriteria = () => {
    saveSortingCriteria(criteria);
    toast.success("Critérios de classificação salvos com sucesso!");
    setIsOpen(false);
  };

  return (
    <div className="beach-card mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-beach-darkGray" />
          <h2 className="text-xl font-bold text-beach-darkGray">
            Critérios de Classificação
          </h2>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-beach-blue hover:text-beach-darkGray transition-colors"
        >
          {isOpen ? "Fechar" : "Configurar"}
        </button>
      </div>

      {!isOpen ? (
        <div className="text-sm text-gray-600">
          <p>Ordem atual de critérios:</p>
          <ol className="list-decimal pl-5 mt-1 mb-3">
            {criteria.map((criterion, index) => (
              <li key={index} className="font-medium">
                {
                  criteriaOptions.find((option) => option.value === criterion)
                    ?.label
                }
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-3">
            Arraste os critérios para definir a ordem de desempate:
          </p>

          <div className="space-y-2 mb-4">
            {criteria.map((criterion, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center bg-white p-3 border rounded shadow-sm cursor-move ${
                  draggedItem === index ? "border-beach-blue bg-blue-50" : ""
                }`}
              >
                <span className="mr-2 text-gray-500 font-bold">
                  {index + 1}.
                </span>
                <ArrowUpDown className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <div className="font-medium">
                    {
                      criteriaOptions.find(
                        (option) => option.value === criterion
                      )?.label
                    }
                  </div>
                  <div className="text-xs text-gray-500">
                    {
                      criteriaOptions.find(
                        (option) => option.value === criterion
                      )?.description
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={saveCriteria}
            className="beach-button-primary w-full flex justify-center items-center gap-2"
          >
            <Save className="h-5 w-5" />
            <span>Salvar Critérios</span>
          </button>
        </div>
      )}
    </div>
  );
}
