'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ApplicationFormPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">COLA Application</h1>

      <Card>
        <CardHeader>
          <CardTitle>Enter Application Data</CardTitle>
          <CardDescription>
            Enter the COLA application information for cross-checking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="app-brand">Brand Name</Label>
                <Input id="app-brand" placeholder="Premium Craft Beer" />
              </div>
              <div>
                <Label htmlFor="cola-number">COLA Number</Label>
                <Input id="cola-number" placeholder="COLA-123456" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="app-abv">ABV (%)</Label>
                <Input id="app-abv" type="number" min="0" max="100" step="0.1" placeholder="5.5" />
              </div>
              <div>
                <Label htmlFor="app-contents">Net Contents</Label>
                <Input id="app-contents" placeholder="12 fl oz" />
              </div>
            </div>

            <div>
              <Label htmlFor="app-producer">Producer/Importer</Label>
              <Input id="app-producer" placeholder="ABC Brewery" />
            </div>

            <div>
              <Label htmlFor="approval-date">Approval Date</Label>
              <Input id="approval-date" type="date" />
            </div>

            <div className="pt-4">
              <Button className="w-full" type="submit">
                Create Application
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
