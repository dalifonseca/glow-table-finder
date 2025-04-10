
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Person } from "@/types/Person";
import { toast } from "sonner";

interface BulkImportProps {
  onImport: (people: Person[]) => void;
}

const BulkImport: React.FC<BulkImportProps> = ({ onImport }) => {
  const [rawData, setRawData] = useState("");

  const handleImport = () => {
    if (!rawData.trim()) {
      toast.error("Por favor, cole os dados antes de importar");
      return;
    }

    try {
      // Dividir o texto por linhas e processar cada linha
      const lines = rawData.trim().split("\n");
      const importedPeople: Person[] = [];
      
      // Processar cada linha
      for (const line of lines) {
        if (!line.trim()) continue;
        
        // Dividir a linha em partes - assumindo formato: Nome, Data, Documento
        const parts = line.split(",").map(part => part.trim());
        
        if (parts.length < 3) {
          toast.warning(`Linha ignorada por formato inválido: ${line}`);
          continue;
        }
        
        // Criar nova pessoa
        const person: Person = {
          id: crypto.randomUUID(),
          name: parts[0],
          birthDate: formatDate(parts[1]),
          documentNumber: parts[2],
        };
        
        importedPeople.push(person);
      }
      
      if (importedPeople.length === 0) {
        toast.error("Nenhum dado válido encontrado");
        return;
      }
      
      onImport(importedPeople);
      setRawData("");
      toast.success(`${importedPeople.length} pessoas importadas com sucesso!`);
      
    } catch (error) {
      console.error("Erro ao processar dados:", error);
      toast.error("Erro ao processar os dados. Verifique o formato.");
    }
  };
  
  // Função para formatar data em formato reconhecido pelo input type="date"
  const formatDate = (dateStr: string): string => {
    try {
      // Tenta diferentes formatos de data comuns
      let date: Date;
      
      // Verifica se é no formato DD/MM/YYYY
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/').map(Number);
        date = new Date(year, month - 1, day);
      } 
      // Verifica se é no formato DD-MM-YYYY
      else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('-').map(Number);
        date = new Date(year, month - 1, day);
      }
      // Assume formato MM/DD/YYYY ou YYYY-MM-DD (compatível com HTML input date)
      else {
        date = new Date(dateStr);
      }
      
      // Verifica se a data é válida
      if (isNaN(date.getTime())) {
        return dateStr; // Retorna original se inválida
      }
      
      // Formata para YYYY-MM-DD (formato aceito pelo input type="date")
      return date.toISOString().split('T')[0];
    } catch (e) {
      // Em caso de erro, retorna a string original
      return dateStr;
    }
  };

  return (
    <div className="space-y-4 mb-6 border p-4 rounded-md">
      <h3 className="text-lg font-medium">Importação em Lote</h3>
      <p className="text-sm text-muted-foreground">
        Cole sua lista de pessoas no formato: Nome, Data de Nascimento, Documento (uma pessoa por linha)
      </p>
      <Textarea
        value={rawData}
        onChange={(e) => setRawData(e.target.value)}
        placeholder="João Silva, 10/05/1985, 123.456.789-00&#10;Maria Souza, 22/07/1990, 987.654.321-00"
        className="min-h-[150px]"
      />
      <Button onClick={handleImport} className="w-full">
        Importar Dados
      </Button>
    </div>
  );
};

export default BulkImport;
