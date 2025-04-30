'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Save } from 'lucide-react';

interface SaveConfigurationFormProps {
  configuration: {
    totalSlots: number;
    pricePerSpin: number;
    defaultPrize: number;
    prizeConfigs: any;
  };
  onSaveComplete?: () => void;
}

export function SaveConfigurationForm({ configuration, onSaveComplete }: SaveConfigurationFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, status } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      setError('Configuration name is required');
      return;
    }
    
    if (status !== 'authenticated') {
      router.push('/auth');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/configurations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          isPublic,
          ...configuration,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save configuration');
      }
      
      // Reset form
      setName('');
      setDescription('');
      setIsPublic(false);
      
      if (onSaveComplete) {
        onSaveComplete();
      }
      
      // Show success or redirect
    } catch (err: any) {
      console.error('Error saving configuration:', err);
      setError(err.message || 'Failed to save configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'unauthenticated') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Save Configuration</CardTitle>
          <CardDescription>Sign in to save your configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <p className="text-muted-foreground mb-4">
              You need to be logged in to save your configuration.
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
        <CardTitle>Save Configuration</CardTitle>
        <CardDescription>Save your current roulette configuration for future use</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="config-name">Configuration Name</Label>
            <Input
              id="config-name"
              placeholder="My Roulette Configuration"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="config-description">Description (Optional)</Label>
            <Textarea
              id="config-description"
              placeholder="A brief description of this configuration"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="public">Make this configuration public</Label>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span className="text-sm text-red-800 dark:text-red-300">{error}</span>
            </div>
          )}
          
          <Button type="submit" disabled={isLoading} className="w-full flex items-center gap-2">
            <Save className="h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}