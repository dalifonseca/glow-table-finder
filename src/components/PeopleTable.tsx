
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
    const nameMap = new Map<string, Person[]>();
    const enrollmentMap = new Map<string, string[]>();
    const courseMap = new Map<string, Person[]>();
    const gradeMap = new Map<string, Person[]>();
    const dateTimeMap = new Map<string, string[]>();
    
    // Agrupar por valores normalizados
    people.forEach((person) => {
      // Normalizar strings para comparação (remover espaços extras, converter para minúsculas)
      const normalizedName = person.name.toLowerCase().trim().replace(/\s+/g, ' ');
      const normalizedEnrollment = person.enrollmentNumber.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      const normalizedCourse = person.course.toLowerCase().trim().replace(/\s+/g, ' ');
      const normalizedGrade = person.grade.toLowerCase().trim().replace(/\s+/g, ' ');
      
      if (!nameMap.has(normalizedName)) nameMap.set(normalizedName, []);
      if (!enrollmentMap.has(normalizedEnrollment)) enrollmentMap.set(normalizedEnrollment, []);
      if (!courseMap.has(normalizedCourse)) courseMap.set(normalizedCourse, []);
      if (!gradeMap.has(normalizedGrade)) gradeMap.set(normalizedGrade, []);
      if (!dateTimeMap.has(person.dateTime)) dateTimeMap.set(person.dateTime, []);
      
      nameMap.get(normalizedName)?.push(person);
      enrollmentMap.get(normalizedEnrollment)?.push(person.id);
      courseMap.get(normalizedCourse)?.push(person);
      gradeMap.get(normalizedGrade)?.push(person);
      dateTimeMap.get(person.dateTime)?.push(person.id);
    });
    
    // Estatísticas de duplicatas
    const duplicateNames = Array.from(nameMap.entries()).filter(([_, group]) => group.length > 1).length;
    const duplicateEnrollments = Array.from(enrollmentMap.entries()).filter(([_, ids]) => ids.length > 1).length;
    const duplicateCourses = Array.from(courseMap.entries()).filter(([_, group]) => group.length > 1).length;
    const duplicateGrades = Array.from(gradeMap.entries()).filter(([_, group]) => group.length > 1).length;
    const duplicateDateTimes = Array.from(dateTimeMap.entries()).filter(([_, ids]) => ids.length > 1).length;
    
    return { 
      duplicateMap: { nameMap, enrollmentMap, courseMap, gradeMap, dateTimeMap },
      summaryStats: { 
        duplicateNames, 
        duplicateEnrollments, 
        duplicateCourses, 
        duplicateGrades, 
        duplicateDateTimes 
      }
    };
  }, [people]);
  
  const isDuplicate = {
    name: (name: string) => {
      const normalizedName = name.toLowerCase().trim().replace(/\s+/g, ' ');
      return (duplicateMap.nameMap.get(normalizedName)?.length || 0) > 1;
    },
    enrollment: (enrollment: string) => {
      const normalizedEnrollment = enrollment.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      return (duplicateMap.enrollmentMap.get(normalizedEnrollment)?.length || 0) > 1;
    },
    course: (course: string) => {
      const normalizedCourse = course.toLowerCase().trim().replace(/\s+/g, ' ');
      return (duplicateMap.courseMap.get(normalizedCourse)?.length || 0) > 1;
    },
    grade: (grade: string) => {
      const normalizedGrade = grade.toLowerCase().trim().replace(/\s+/g, ' ');
      return (duplicateMap.gradeMap.get(normalizedGrade)?.length || 0) > 1;
    },
    dateTime: (dateTime: string) => (duplicateMap.dateTimeMap.get(dateTime)?.length || 0) > 1,
  };
  
  // Formatar data e hora para exibição
  const formatDateTime = (dateTimeString: string) => {
    try {
      const dateTime = new Date(dateTimeString);
      return dateTime.toLocaleString("pt-BR");
    } catch (e) {
      return dateTimeString;
    }
  };

  // Verificar se existem duplicatas
  const hasDuplicates = summaryStats.duplicateNames > 0 || 
                        summaryStats.duplicateEnrollments > 0 || 
                        summaryStats.duplicateCourses > 0 ||
                        summaryStats.duplicateGrades > 0 ||
                        summaryStats.duplicateDateTimes > 0;

  return (
    <div className="space-y-4">
      {people.length > 0 && hasDuplicates && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md flex gap-2 items-center">
          <AlertTriangle className="text-yellow-500" size={20} />
          <div className="text-sm">
            <p className="font-medium">Duplicatas encontradas:</p>
            <p className="text-muted-foreground">
              {summaryStats.duplicateNames > 0 && `${summaryStats.duplicateNames} nomes, `}
              {summaryStats.duplicateEnrollments > 0 && `${summaryStats.duplicateEnrollments} matrículas, `}
              {summaryStats.duplicateCourses > 0 && `${summaryStats.duplicateCourses} cursos, `}
              {summaryStats.duplicateGrades > 0 && `${summaryStats.duplicateGrades} séries, `}
              {summaryStats.duplicateDateTimes > 0 && `${summaryStats.duplicateDateTimes} datas/horas`}
            </p>
          </div>
        </div>
      )}
    
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data e Hora</TableHead>
              <TableHead>Nome Completo</TableHead>
              <TableHead>Número de Matrícula</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead>Série</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {people.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Cole dados acima para identificar duplicatas
                </TableCell>
              </TableRow>
            ) : (
              people.map((person) => (
                <TableRow key={person.id}>
                  <TableCell className={cn(
                    isDuplicate.dateTime(person.dateTime) && "bg-duplicate font-medium"
                  )}>
                    {formatDateTime(person.dateTime)}
                  </TableCell>
                  <TableCell className={cn(
                    isDuplicate.name(person.name) && "bg-duplicate font-medium"
                  )}>
                    {person.name}
                  </TableCell>
                  <TableCell className={cn(
                    isDuplicate.enrollment(person.enrollmentNumber) && "bg-duplicate font-medium"
                  )}>
                    {person.enrollmentNumber}
                  </TableCell>
                  <TableCell className={cn(
                    isDuplicate.course(person.course) && "bg-duplicate font-medium"
                  )}>
                    {person.course}
                  </TableCell>
                  <TableCell className={cn(
                    isDuplicate.grade(person.grade) && "bg-duplicate font-medium"
                  )}>
                    {person.grade}
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
