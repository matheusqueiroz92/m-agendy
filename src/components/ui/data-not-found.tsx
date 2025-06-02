interface DataNotFoundProps {
  title: string;
  icon: React.ReactNode;
}

export const DataNotFound = ({ title, icon }: DataNotFoundProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-muted rounded-full p-6">{icon}</div>
      <h3 className="text-foreground mt-4 text-lg font-medium">
        Nenhum {title} cadastrado!
      </h3>
      <p className="text-muted-foreground mt-2 text-sm">
        Comece adicionando seu primeiro {title} clicando no botão acima.
      </p>
    </div>
  );
};
