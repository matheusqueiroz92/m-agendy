interface DataNotFoundProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
}

export const DataNotFound = ({
  icon,
  title,
  description,
}: DataNotFoundProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-muted rounded-full p-6">{icon}</div>
      <h3 className="text-foreground mt-4 text-lg font-medium">{title}</h3>
      <p className="text-muted-foreground mt-2 text-sm">{description}</p>
    </div>
  );
};
