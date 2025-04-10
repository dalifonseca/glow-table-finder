
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Person } from "@/types/Person";
import { toast } from "sonner";
import { FileSpreadsheet, FileText, Download } from "lucide-react";

interface ExportOptionsProps {
  people: Person[];
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ people }) => {
  // Converter dados para CSV
  const convertToCSV = (people: Person[]) => {
    if (people.length === 0) return "";
    
    const headers = ["Nome", "Data de Nascimento", "Número do Documento"];
    const rows = people.map(person => {
      const date = new Date(person.birthDate).toLocaleDateString("pt-BR");
      return [person.name, date, person.documentNumber];
    });
    
    return [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
  };

  // Converter dados para JSON
  const convertToJSON = (people: Person[]) => {
    return JSON.stringify(people, null, 2);
  };

  // Exportar para Excel/CSV
  const exportToCSV = () => {
    const csv = convertToCSV(people);
    if (!csv) {
      toast.error("Não há dados para exportar");
      return;
    }
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "pessoas.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Dados exportados como CSV/Excel");
  };

  // Exportar para JSON
  const exportToJSON = () => {
    if (people.length === 0) {
      toast.error("Não há dados para exportar");
      return;
    }
    
    const json = convertToJSON(people);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "pessoas.json");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Dados exportados como JSON");
  };

  // Exportar para texto simples (para Google Docs)
  const exportToText = () => {
    if (people.length === 0) {
      toast.error("Não há dados para exportar");
      return;
    }
    
    const headers = ["Nome", "Data de Nascimento", "Número do Documento"];
    const rows = people.map(person => {
      const date = new Date(person.birthDate).toLocaleDateString("pt-BR");
      return `${person.name}\t${date}\t${person.documentNumber}`;
    });
    
    const text = [
      headers.join("\t"),
      ...rows
    ].join("\n");
    
    const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "pessoas.txt");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Dados exportados como texto");
  };

  return (
    <div className="mt-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={people.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={exportToCSV}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span>Excel/CSV</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportToJSON}>
            <FileText className="mr-2 h-4 w-4" />
            <span>JSON</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportToText}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Texto (Google Docs)</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ExportOptions;
