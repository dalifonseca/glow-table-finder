
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
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [course, setCourse] = useState("");
  const [grade, setGrade] = useState("");
  const [dateTime, setDateTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !enrollmentNumber || !course || !grade || !dateTime) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    const newPerson: Person = {
      id: crypto.randomUUID(),
      name,
      enrollmentNumber,
      course,
      grade,
      dateTime,
    };
    
    onAddPerson(newPerson);
    
    // Reset form
    setName("");
    setEnrollmentNumber("");
    setCourse("");
    setGrade("");
    setDateTime("");
    
    toast.success("Registro adicionado com sucesso!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite o nome completo"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="enrollmentNumber">Número de Matrícula</Label>
          <Input
            id="enrollmentNumber"
            value={enrollmentNumber}
            onChange={(e) => setEnrollmentNumber(e.target.value)}
            placeholder="Digite o número de matrícula"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="course">Curso</Label>
          <Input
            id="course"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="Digite o curso"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade">Série</Label>
          <Input
            id="grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="Digite a série"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dateTime">Data e Hora</Label>
          <Input
            id="dateTime"
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full md:w-auto">
        Adicionar Registro
      </Button>
    </form>
  );
};

export default PersonForm;
