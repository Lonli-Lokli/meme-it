'use client';

import { Button } from "@/components/ui/button";
import { updateMemeTypes, fixMemeTypes } from "@/lib/firebase-utils";
import { useState } from "react";

export default function AdminPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleUpdateTypes = async () => {
    try {
      setIsUpdating(true);
      await updateMemeTypes();
      setResult("Successfully updated meme types!");
    } catch (error) {
      setResult(`Error updating meme types: ${error}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFixTypes = async () => {
    try {
      setIsFixing(true);
      await fixMemeTypes();
      setResult("Successfully fixed meme types!");
    } catch (error) {
      setResult(`Error fixing meme types: ${error}`);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <main className="container py-6">
      <h1 className="text-2xl font-bold mb-4">Admin Tools</h1>
      <div className="space-y-4">
        <div className="flex gap-4">
          <Button 
            onClick={handleUpdateTypes} 
            disabled={isUpdating || isFixing}
          >
            {isUpdating ? "Updating..." : "Update Meme Types"}
          </Button>
          <Button 
            onClick={handleFixTypes} 
            disabled={isUpdating || isFixing}
            variant="secondary"
          >
            {isFixing ? "Fixing..." : "Fix Type Mismatches"}
          </Button>
        </div>
        {result && (
          <p className="mt-2 text-sm text-slate-600">{result}</p>
        )}
      </div>
    </main>
  );
} 