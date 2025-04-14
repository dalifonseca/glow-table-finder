
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
          // Divide a linha em partes para extrair os componentes
          const words = line.split(/\s+/);
          if (words.length >= 5) {
            // Tenta identificar os componentes com base no padrão
            // Assume: DateTime, Nome, Matrícula, Curso, Série
            const potentialDateTime = words.slice(0, 2).join(" "); // Assume data e hora nos primeiros tokens
            
            // Procura por padrões de matrícula (geralmente números)
            const enrollmentPattern = /\b\d+\b/;
            const enrollmentMatch = line.match(enrollmentPattern);
            
            let potentialEnrollment = "";
            let potentialName = "";
            let potentialCourse = "";
            let potentialGrade = "";
            
            if (enrollmentMatch) {
              potentialEnrollment = enrollmentMatch[0];
              
              // Divide o resto em partes para identificar nome, curso e série
              const remainingText = line.replace(potentialDateTime, "").replace(potentialEnrollment, "").trim();
              const remainingParts = remainingText.split(/\s{2,}|\t/); // Divide por 2+ espaços ou tab
              
              if (remainingParts.length >= 3) {
                potentialName = remainingParts[0].trim();
                potentialCourse = remainingParts[1].trim();
                potentialGrade = remainingParts[2].trim();
              } else {
                // Tentativa alternativa de divisão
                const halfPoint = Math.floor(remainingText.length / 2);
                potentialName = remainingText.substring(0, halfPoint).trim();
                const courseGradePart = remainingText.substring(halfPoint).trim();
                
                // Divide a parte de curso/série
                const cgParts = courseGradePart.split(/\s{2,}|\t/);
                if (cgParts.length >= 2) {
                  potentialCourse = cgParts[0].trim();
                  potentialGrade = cgParts[1].trim();
                } else {
                  // Última tentativa - divide pela metade
                  const cgHalfPoint = Math.floor(courseGradePart.length / 2);
                  potentialCourse = courseGradePart.substring(0, cgHalfPoint).trim();
                  potentialGrade = courseGradePart.substring(cgHalfPoint).trim();
                }
              }
            } else {
              // Se não encontrou matrícula clara, faz uma divisão aproximada
              potentialName = words.slice(2, 4).join(" "); // Assume nome nos próximos 2-3 tokens
              potentialEnrollment = words.slice(4, 5).join(" "); // Próximo token como matrícula
              potentialCourse = words.slice(5, 6).join(" "); // Próximo como curso
              potentialGrade = words.slice(6).join(" "); // Resto como série
            }
            
            parts = [potentialDateTime, potentialName, potentialEnrollment, potentialCourse, potentialGrade];
          }
        }
        
        if (parts.length < 5) {
          errors.push(`Linha ${i + 1} (${line}) - formato inválido`);
          continue;
        }
        
        // Criar novo registro
        const person: Person = {
          id: crypto.randomUUID(),
          dateTime: formatDateTime(parts[0]),
          name: parts[1],
          enrollmentNumber: parts[2],
          course: parts[3],
          grade: parts[4],
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
      toast.success(`${importedPeople.length} registros importados com sucesso!`);
      
    } catch (error) {
      console.error("Erro ao processar dados:", error);
      toast.error("Erro ao processar os dados. Verifique o formato.");
    }
  };
  
  // Função para formatar data e hora
  const formatDateTime = (dateTimeStr: string): string => {
    try {
      // Se já estiver no formato correto, retorna
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateTimeStr)) {
        return dateTimeStr;
      }
      
      // Verifica diferentes formatos comuns de data e hora
      let dateTime: Date | null = null;
      
      // Formato DD/MM/YYYY HH:MM
      if (/^\d{1,2}\/\d{1,2}\/\d{4}\s\d{1,2}:\d{1,2}$/.test(dateTimeStr)) {
        const parts = dateTimeStr.split(' ');
        const dateParts = parts[0].split('/').map(Number);
        const timeParts = parts[1].split(':').map(Number);
        dateTime = new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1]);
      }
      // Formato DD-MM-YYYY HH:MM
      else if (/^\d{1,2}-\d{1,2}-\d{4}\s\d{1,2}:\d{1,2}$/.test(dateTimeStr)) {
        const parts = dateTimeStr.split(' ');
        const dateParts = parts[0].split('-').map(Number);
        const timeParts = parts[1].split(':').map(Number);
        dateTime = new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1]);
      }
      // Tenta fazer parse com Date padrão
      else {
        dateTime = new Date(dateTimeStr);
      }
      
      // Verifica se é uma data válida
      if (dateTime && !isNaN(dateTime.getTime())) {
        return dateTime.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:MM
      }
      
      // Se não conseguiu converter, retorna o original
      return dateTimeStr;
    } catch (e) {
      return dateTimeStr;
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
        <span className="font-medium block mt-1">Data e Hora, Nome Completo, Número de Matrícula, Curso, Série</span>
      </p>
      
      <Textarea
        value={rawData}
        onChange={(e) => setRawData(e.target.value)}
        placeholder="01/05/2025 14:30, João Silva, 123456, Engenharia, 5º período&#10;02/05/2025 09:15, Maria Santos, 654321, Medicina, 3º ano&#10;..."
        className="min-h-[200px] font-mono text-sm"
      />
      
      <Button onClick={handleImport} className="w-full">
        Identificar Duplicatas
      </Button>
    </div>
  );
};

export default BulkImport;
