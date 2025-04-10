
import React, { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Person } from "@/types/Person";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface PeopleTableProps {
  people: Person[];
  onDeletePerson: (id: string) => void;
}

const PeopleTable: React.FC<PeopleTableProps> = ({ people, onDeletePerson }) => {
  // Identificar duplicatas
  const { duplicateMap, summaryStats } = useMemo(() => {
    const nameMap = new Map<string, number>();
    const birthDateMap = new Map<string, number>();
    const documentMap = new Map<string, number>();
    
    // Contagem de ocorrências
    people.forEach((person) => {
      // Normalizar strings para comparação (remover espaços extras, converter para minúsculas)
      const normalizedName = person.name.toLowerCase().trim().replace(/\s+/g, ' ');
      const normalizedDoc = person.documentNumber.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      
      nameMap.set(normalizedName, (nameMap.get(normalizedName) || 0) + 1);
      birthDateMap.set(person.birthDate, (birthDateMap.get(person.birthDate) || 0) + 1);
      documentMap.set(normalizedDoc, (documentMap.get(normalizedDoc) || 0) + 1);
    });
    
    // Estatísticas de duplicatas
    const duplicateNames = Array.from(nameMap.entries()).filter(([_, count]) => count > 1).length;
    const duplicateDates = Array.from(birthDateMap.entries()).filter(([_, count]) => count > 1).length;
    const duplicateDocs = Array.from(documentMap.entries()).filter(([_, count]) => count > 1).length;
    
    return { 
      duplicateMap: { nameMap, birthDateMap, documentMap },
      summaryStats: { duplicateNames, duplicateDates, duplicateDocs }
    };
  }, [people]);
  
  const isDuplicate = {
    name: (name: string) => {
      const normalizedName = name.toLowerCase().trim().replace(/\s+/g, ' ');
      return (duplicateMap.nameMap.get(normalizedName) || 0) > 1;
    },
    birthDate: (date: string) => (duplicateMap.birthDateMap.get(date) || 0) > 1,
    document: (doc: string) => {
      const normalizedDoc = doc.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      return (duplicateMap.documentMap.get(normalizedDoc) || 0) > 1;
    },
  };
  
  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR");
    } catch (e) {
      return dateString;
    }
  };

  // Verificar se existem duplicatas
  const hasDuplicates = summaryStats.duplicateNames > 0 || 
                        summaryStats.duplicateDates > 0 || 
                        summaryStats.duplicateDocs > 0;

  return (
    <div className="space-y-4">
      {people.length > 0 && hasDuplicates && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md flex gap-2 items-center">
          <AlertTriangle className="text-yellow-500" size={20} />
          <div className="text-sm">
            <p className="font-medium">Duplicatas encontradas:</p>
            <p className="text-muted-foreground">
              {summaryStats.duplicateNames > 0 && `${summaryStats.duplicateNames} nomes, `}
              {summaryStats.duplicateDates > 0 && `${summaryStats.duplicateDates} datas, `}
              {summaryStats.duplicateDocs > 0 && `${summaryStats.duplicateDocs} documentos`}
            </p>
          </div>
        </div>
      )}
    
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
                  Cole dados acima para identificar duplicatas
                </TableCell>
              </TableRow>
            ) : (
              people.map((person) => (
                <TableRow key={person.id}>
                  <TableCell className={cn(
                    isDuplicate.name(person.name) && "bg-duplicate font-medium"
                  )}>
                    {person.name}
                  </TableCell>
                  <TableCell className={cn(
                    isDuplicate.birthDate(person.birthDate) && "bg-duplicate font-medium"
                  )}>
                    {formatDate(person.birthDate)}
                  </TableCell>
                  <TableCell className={cn(
                    isDuplicate.document(person.documentNumber) && "bg-duplicate font-medium"
                  )}>
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
    </div>
  );
};

export default PeopleTable;
