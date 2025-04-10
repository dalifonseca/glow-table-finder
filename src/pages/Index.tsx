
import React from "react";
import PersonManager from "@/components/PersonManager";

const Index = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Sistema de Cadastro com Detecção de Duplicatas</h1>
        <PersonManager />
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Células destacadas em amarelo indicam informações duplicadas.</p>
          <p className="mt-2">Use o botão Exportar para baixar os dados em diferentes formatos.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
