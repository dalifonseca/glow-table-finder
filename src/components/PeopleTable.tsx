
import React, { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Person } from "@/types/Person";
import { cn } from "@/lib/utils";

interface PeopleTableProps {
  people: Person[];
  onDeletePerson: (id: string) => void;
}

const PeopleTable: React.FC<PeopleTableProps> = ({ people, onDeletePerson }) => {
  // Identificar duplicatas
  const duplicateMap = useMemo(() => {
    const nameMap = new Map<string, number>();
    const birthDateMap = new Map<string, number>();
    const documentMap = new Map<string, number>();
    
    // Contagem de ocorrências
    people.forEach((person) => {
      nameMap.set(person.name.toLowerCase(), (nameMap.get(person.name.toLowerCase()) || 0) + 1);
      birthDateMap.set(person.birthDate, (birthDateMap.get(person.birthDate) || 0) + 1);
      documentMap.set(person.documentNumber.toLowerCase(), (documentMap.get(person.documentNumber.toLowerCase()) || 0) + 1);
    });
    
    return { nameMap, birthDateMap, documentMap };
  }, [people]);
  
  const isDuplicate = {
    name: (name: string) => (duplicateMap.nameMap.get(name.toLowerCase()) || 0) > 1,
    birthDate: (date: string) => (duplicateMap.birthDateMap.get(date) || 0) > 1,
    document: (doc: string) => (duplicateMap.documentMap.get(doc.toLowerCase()) || 0) > 1,
  };
  
  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Data de Nascimento</TableHead>
            <TableHead>Número do Documento</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {people.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                Nenhuma pessoa cadastrada
              </TableCell>
            </TableRow>
          ) : (
            people.map((person) => (
              <TableRow key={person.id}>
                <TableCell className={cn(isDuplicate.name(person.name) && "bg-duplicate")}>
                  {person.name}
                </TableCell>
                <TableCell className={cn(isDuplicate.birthDate(person.birthDate) && "bg-duplicate")}>
                  {formatDate(person.birthDate)}
                </TableCell>
                <TableCell className={cn(isDuplicate.document(person.documentNumber) && "bg-duplicate")}>
                  {person.documentNumber}
                </TableCell>
                <TableCell className="text-right">
                  <button
                    onClick={() => onDeletePerson(person.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Excluir
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PeopleTable;
