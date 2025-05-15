
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  showBackButton = true
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          )}
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
      </div>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export default PageHeader;
