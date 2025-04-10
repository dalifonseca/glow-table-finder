
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Person } from "@/types/Person";
import { toast } from "sonner";
import { Clipboard } from "lucide-react";

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
      const errors: string[] = [];
      
      // Processar cada linha
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Diferentes possíveis delimitadores
        let parts: string[] = [];
        
        // Tenta com vírgula
        if (line.includes(",")) {
          parts = line.split(",").map(part => part.trim());
        } 
        // Tenta com ponto e vírgula
        else if (line.includes(";")) {
          parts = line.split(";").map(part => part.trim());
        }
        // Tenta com tabulação
        else if (line.includes("\t")) {
          parts = line.split("\t").map(part => part.trim());
        }
        // Se não encontrou delimitadores claros, tenta dividir por espaços (mais arriscado)
        else {
          // Assume que o último grupo de números é o documento e o penúltimo pode ser uma data
          const words = line.split(/\s+/);
          if (words.length >= 3) {
            // Verifica se o que parece ser data está no formato de data
            const potentialDoc = words.pop() || "";
            let potentialDate = "";
            let potentialName = "";
            
            // Verifica padrões comuns de data
            const datePattern = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})|(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/;
            const dateMatch = line.match(datePattern);
            
            if (dateMatch) {
              potentialDate = dateMatch[0];
              // Remove a data da linha para extrair o nome
              const nameParts = line.replace(potentialDoc, "").replace(potentialDate, "").trim().split(/\s+/);
              potentialName = nameParts.join(" ");
            } else {
              // Se não encontrou padrão de data, assume que os dois últimos são data e documento
              const datePart = words.pop() || "";
              potentialDate = datePart;
              potentialName = words.join(" ");
            }
            
            parts = [potentialName, potentialDate, potentialDoc];
          }
        }
        
        if (parts.length < 3) {
          errors.push(`Linha ${i + 1} (${line}) - formato inválido`);
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
      
      if (errors.length > 0) {
        toast.warning(`${errors.length} linhas com problemas. Verifique o formato dos dados.`);
        console.error("Linhas com problemas:", errors);
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
      // Verifica se é no formato DD.MM.YYYY
      else if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('.').map(Number);
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
      <div className="flex items-center gap-2 mb-2">
        <Clipboard className="text-muted-foreground" size={18} />
        <h3 className="text-lg font-medium">Cole seus dados abaixo</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Cole diretamente de documentos, planilhas ou listas. O sistema tentará identificar: 
        <span className="font-medium block mt-1">Nome Completo, Data de Nascimento, Número do Documento</span>
      </p>
      
      <Textarea
        value={rawData}
        onChange={(e) => setRawData(e.target.value)}
        placeholder="João Silva, 10/05/1985, 123.456.789-00&#10;Maria Souza, 22/07/1990, 987.654.321-00&#10;..."
        className="min-h-[200px] font-mono text-sm"
      />
      
      <Button onClick={handleImport} className="w-full">
        Identificar Duplicatas
      </Button>
    </div>
  );
};

export default BulkImport;
