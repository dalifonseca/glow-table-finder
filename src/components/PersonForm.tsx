
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Person } from "@/types/Person";
import { toast } from "sonner";

interface PersonFormProps {
  onAddPerson: (person: Person) => void;
}

const PersonForm: React.FC<PersonFormProps> = ({ onAddPerson }) => {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !birthDate || !documentNumber) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    const newPerson: Person = {
      id: crypto.randomUUID(),
      name,
      birthDate,
      documentNumber,
    };
    
    onAddPerson(newPerson);
    
    // Reset form
    setName("");
    setBirthDate("");
    setDocumentNumber("");
    
    toast.success("Pessoa adicionada com sucesso!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite o nome completo"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="birthDate">Data de Nascimento</Label>
          <Input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="documentNumber">Número do Documento</Label>
          <Input
            id="documentNumber"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            placeholder="CPF/RG"
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full md:w-auto">
        Adicionar Pessoa
      </Button>
    </form>
  );
};

export default PersonForm;
