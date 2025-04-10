
import React from "react";
import PersonManager from "@/components/PersonManager";

const Index = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Sistema de Detecção de Duplicatas</h1>
        <PersonManager />
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Células destacadas em amarelo indicam informações duplicadas.</p>
          <p className="mt-2">Cole dados diretamente de outros documentos (uma entrada por linha) no formato:</p>
          <p className="mt-1 font-medium">Nome Completo, Data de Nascimento, Número do Documento</p>
          <p className="mt-2">Use o botão "Remover Duplicatas" para manter apenas a última ocorrência de cada informação duplicada.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
