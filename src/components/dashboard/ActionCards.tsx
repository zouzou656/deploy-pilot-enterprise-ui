
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Server, GitBranch, FileText } from 'lucide-react';

const ActionCards = () => {
  const actions = [
    {
      title: 'Generate JAR',
      icon: Package,
      description: 'Create a new JAR file for deployment',
      link: '/jar-generation',
      color: 'bg-blue-50 dark:bg-blue-950',
      iconColor: 'text-blue-500',
      buttonVariant: 'default' as const,
    },
    {
      title: 'Deploy to WebLogic',
      icon: Server,
      description: 'Deploy existing JAR to WebLogic server',
      link: '/weblogic-deployment',
      color: 'bg-green-50 dark:bg-green-950',
      iconColor: 'text-green-500',
      buttonVariant: 'outline' as const,
    },
    {
      title: 'Pull Git Changes',
      icon: GitBranch,
      description: 'Update local repository with latest changes',
      link: '/git',
      color: 'bg-purple-50 dark:bg-purple-950',
      iconColor: 'text-purple-500',
      buttonVariant: 'outline' as const,
    },
    {
      title: 'Edit Settings',
      icon: FileText,
      description: 'Modify deployment configuration settings',
      link: '/settings-file',
      color: 'bg-amber-50 dark:bg-amber-950',
      iconColor: 'text-amber-500',
      buttonVariant: 'outline' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, i) => (
        <Card key={i} className="overflow-hidden hover:border-primary/50 transition-all">
          <div className={`p-6 ${action.color}`}>
            <action.icon className={`w-8 h-8 ${action.iconColor}`} />
          </div>
          <CardContent className="pt-6">
            <h3 className="font-medium text-lg mb-1">{action.title}</h3>
            <p className="text-sm text-muted-foreground">{action.description}</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant={action.buttonVariant} className="w-full">
              <Link to={action.link}>
                {action.title}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ActionCards;
