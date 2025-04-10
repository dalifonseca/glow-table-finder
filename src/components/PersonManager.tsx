
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
  const [importMode, setImportMode] = useState<"form" | "bulk">("form");

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Pessoas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <Button 
              variant={importMode === "form" ? "default" : "outline"} 
              onClick={() => setImportMode("form")}
              className="flex-1"
            >
              Formulário
            </Button>
            <Button 
              variant={importMode === "bulk" ? "default" : "outline"} 
              onClick={() => setImportMode("bulk")}
              className="flex-1"
            >
              Importação em Lote
            </Button>
          </div>
          
          {importMode === "form" ? (
            <PersonForm onAddPerson={handleAddPerson} />
          ) : (
            <BulkImport onImport={handleImportPeople} />
          )}
        </div>
        
        <PeopleTable people={people} onDeletePerson={handleDeletePerson} />
        <div className="mt-4 flex justify-end">
          <ExportOptions people={people} />
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonManager;
