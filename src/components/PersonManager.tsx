
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PersonForm from "@/components/PersonForm";
import PeopleTable from "@/components/PeopleTable";
import ExportOptions from "@/components/ExportOptions";
import BulkImport from "@/components/BulkImport";
import { Person } from "@/types/Person";
import { toast } from "sonner";

const PersonManager: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [importMode, setImportMode] = useState<"form" | "bulk">("bulk");

  // Carregar dados salvos ao iniciar
  useEffect(() => {
    const savedPeople = localStorage.getItem("peopleData");
    if (savedPeople) {
      try {
        setPeople(JSON.parse(savedPeople));
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados salvos");
      }
    }
  }, []);

  // Salvar dados quando houver mudanças
  useEffect(() => {
    localStorage.setItem("peopleData", JSON.stringify(people));
  }, [people]);

  const handleAddPerson = (person: Person) => {
    setPeople([...people, person]);
  };

  const handleImportPeople = (importedPeople: Person[]) => {
    setPeople([...people, ...importedPeople]);
  };

  const handleDeletePerson = (id: string) => {
    setPeople(people.filter(person => person.id !== id));
    toast.info("Registro removido");
  };

  const handleClearAll = () => {
    if (window.confirm("Deseja realmente limpar todos os dados?")) {
      setPeople([]);
      toast.info("Todos os registros foram removidos");
    }
  };

  const handleRemoveDuplicates = () => {
    if (people.length === 0) return;
    
    if (window.confirm("Deseja remover as entradas duplicadas, mantendo apenas a última de cada?")) {
      // Identificar duplicatas
      const nameMap = new Map<string, Person[]>();
      const birthDateMap = new Map<string, Person[]>();
      const documentMap = new Map<string, Person[]>();
      
      // Agrupar entradas por nome, data e documento
      people.forEach((person) => {
        const normalizedName = person.name.toLowerCase().trim().replace(/\s+/g, ' ');
        const normalizedDoc = person.documentNumber.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        
        if (!nameMap.has(normalizedName)) nameMap.set(normalizedName, []);
        if (!birthDateMap.has(person.birthDate)) birthDateMap.set(person.birthDate, []);
        if (!documentMap.has(normalizedDoc)) documentMap.set(normalizedDoc, []);
        
        nameMap.get(normalizedName)?.push(person);
        birthDateMap.get(person.birthDate)?.push(person);
        documentMap.get(normalizedDoc)?.push(person);
      });
      
      // Identificar IDs a serem removidos (todos, exceto o último de cada grupo)
      const idsToRemove = new Set<string>();
      
      // Para cada grupo com mais de uma entrada, marcar todos exceto o último para remoção
      const processGroup = (group: Person[]) => {
        if (group.length > 1) {
          // Ordenar por ID (assumindo que IDs mais recentes são maiores)
          group.sort((a, b) => a.id.localeCompare(b.id));
          
          // Marcar todos exceto o último para remoção
          for (let i = 0; i < group.length - 1; i++) {
            idsToRemove.add(group[i].id);
          }
        }
      };
      
      // Processar cada grupo de duplicatas
      nameMap.forEach(processGroup);
      birthDateMap.forEach(processGroup);
      documentMap.forEach(processGroup);
      
      // Filtrar pessoas, removendo as marcadas
      const filteredPeople = people.filter(person => !idsToRemove.has(person.id));
      
      // Atualizar a lista
      setPeople(filteredPeople);
      
      // Notificar o usuário
      const removedCount = idsToRemove.size;
      toast.success(`${removedCount} ${removedCount === 1 ? 'entrada duplicada foi removida' : 'entradas duplicadas foram removidas'}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identificador de Duplicatas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <Button 
              variant={importMode === "bulk" ? "default" : "outline"} 
              onClick={() => setImportMode("bulk")}
              className="flex-1"
            >
              Colar Dados
            </Button>
            <Button 
              variant={importMode === "form" ? "default" : "outline"} 
              onClick={() => setImportMode("form")}
              className="flex-1"
            >
              Formulário Manual
            </Button>
          </div>
          
          {importMode === "form" ? (
            <PersonForm onAddPerson={handleAddPerson} />
          ) : (
            <BulkImport onImport={handleImportPeople} />
          )}
        </div>
        
        <PeopleTable people={people} onDeletePerson={handleDeletePerson} />
        
        <div className="mt-4 flex justify-between flex-wrap gap-2">
          <div className="flex gap-2">
            {people.length > 0 && (
              <>
                <Button variant="destructive" onClick={handleClearAll}>
                  Limpar Todos
                </Button>
                <Button variant="secondary" onClick={handleRemoveDuplicates}>
                  Remover Duplicatas
                </Button>
              </>
            )}
          </div>
          <ExportOptions people={people} />
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonManager;
