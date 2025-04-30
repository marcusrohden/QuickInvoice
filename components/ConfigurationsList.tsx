'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Copy, Globe, Lock } from 'lucide-react';

type Configuration = {
  id: number;
  name: string;
  description: string;
  totalSlots: number;
  pricePerSpin: number;
  defaultPrize: number;
  prizeConfigs: any;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export function ConfigurationsList() {
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      fetchConfigurations();
    }
  }, [status]);

  const fetchConfigurations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/configurations');
      
      if (!response.ok) {
        throw new Error('Failed to fetch configurations');
      }
      
      const data = await response.json();
      setConfigurations(data);
    } catch (err) {
      console.error('Error fetching configurations:', err);
      setError('Failed to load your configurations. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this configuration?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/configurations/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete configuration');
      }
      
      // Remove the deleted configuration from the list
      setConfigurations(configurations.filter(config => config.id !== id));
    } catch (err) {
      console.error('Error deleting configuration:', err);
      alert('Failed to delete configuration. Please try again.');
    }
  };

  const handleLoad = (id: number) => {
    router.push(`/?config=${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/configurations/edit/${id}`);
  };

  const handleDuplicate = async (id: number) => {
    try {
      // Fetch the configuration to duplicate
      const response = await fetch(`/api/configurations/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }
      
      const config = await response.json();
      
      // Create a new configuration based on the existing one
      const duplicateResponse = await fetch('/api/configurations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...config,
          name: `${config.name} (Copy)`,
          isPublic: false,
        }),
      });
      
      if (!duplicateResponse.ok) {
        throw new Error('Failed to duplicate configuration');
      }
      
      // Refresh the list
      fetchConfigurations();
    } catch (err) {
      console.error('Error duplicating configuration:', err);
      alert('Failed to duplicate configuration. Please try again.');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Configurations</CardTitle>
          <CardDescription>Log in to save and manage your configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Create an account to save your configurations and access them from anywhere.
            </p>
            <Button onClick={() => router.push('/auth')}>
              Sign In or Create Account
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Saved Configurations</CardTitle>
        <CardDescription>Manage your saved roulette game configurations</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md mb-4">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}
        
        {configurations.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground mb-4">You don't have any saved configurations yet.</p>
            <p className="text-sm text-muted-foreground">
              Configure your game parameters and click "Save Configuration" to store them here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slots</TableHead>
                  <TableHead>Price/Spin</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configurations.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell className="font-medium">{config.name}</TableCell>
                    <TableCell>{config.totalSlots}</TableCell>
                    <TableCell>${config.pricePerSpin.toFixed(2)}</TableCell>
                    <TableCell>
                      {config.isPublic ? (
                        <Globe className="h-4 w-4 text-green-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(config.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleLoad(config.id)}
                          title="Load configuration"
                        >
                          <span className="sr-only">Load</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L12 14M12 14L8 10M12 14L16 10M22 14L22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21L4 21C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19L2 14" />
                          </svg>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(config.id)}
                          title="Edit configuration"
                        >
                          <span className="sr-only">Edit</span>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDuplicate(config.id)}
                          title="Duplicate configuration"
                        >
                          <span className="sr-only">Duplicate</span>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(config.id)}
                          title="Delete configuration"
                          className="text-red-500 hover:text-red-600"
                        >
                          <span className="sr-only">Delete</span>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}