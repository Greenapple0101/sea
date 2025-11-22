import { Card, CardContent } from "../ui/card";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export function SectionCard({ 
  title, 
  children, 
  className = "",
  headerAction
}: SectionCardProps) {
  return (
    <Card className={`border-2 border-gray-300 rounded-lg ${className}`}>
      <CardContent className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          {headerAction}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
