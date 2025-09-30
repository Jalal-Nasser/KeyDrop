'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from "@/lib/supabase-client";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

type UserProfile = {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  created_at?: string | null;
};

export default function UserDiscountsPage() {
  const router = useRouter();
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/admin/users');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch users');
        }
        
        setUserProfiles(data.users || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error instanceof Error ? error.message : 'Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch('/api/admin/apply-discount', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to apply discount');
      }
      
      // Handle success
      alert('Discount applied successfully!');
    } catch (error) {
      console.error('Error applying discount:', error);
      setError(error instanceof Error ? error.message : 'Failed to apply discount');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">User Discounts</h1>
          <p className="text-muted-foreground">Apply special discounts to user accounts</p>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Apply User Discount</CardTitle>
          <CardDescription>Apply a special discount to a user's account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">Select User</Label>
              <select
                id="userId"
                name="userId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={isLoading || !!error}
              >
                <option value="">Select a user...</option>
                {userProfiles.length > 0 ? (
                  userProfiles.map((user) => {
                    const firstName = user.first_name?.replace(/^"|"$/g, '') || '';
                    const lastName = user.last_name?.replace(/^"|"$/g, '') || '';
                    const displayName = [
                      firstName,
                      lastName
                    ].filter(Boolean).join(' ').trim() || 'Unnamed User';
                    
                    return (
                      <option key={user.id} value={user.id}>
                        {displayName} ({user.email || 'No email'})
                      </option>
                    );
                  })
                ) : (
                  <option value="" disabled>No users found in the database</option>
                )}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discountType">Discount Type</Label>
              <select
                id="discountType"
                name="discountType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={isLoading || !!error}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountValue">Discount Value</Label>
              <Input 
                type="number" 
                id="discountValue" 
                name="discountValue" 
                min="0.01" 
                step="0.01"
                required 
                placeholder="10.00"
                disabled={isLoading || !!error}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
              <Input 
                type="datetime-local" 
                id="expiresAt" 
                name="expiresAt" 
                min={new Date().toISOString().slice(0, 16)}
                disabled={isLoading || !!error}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  name="isActive" 
                  defaultChecked
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  disabled={isLoading || !!error}
                />
                <span>Active</span>
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !!error}
            >
              {isLoading ? 'Loading...' : 'Apply Discount'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
