"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MigrationButtonProps {
  onMigrate?: () => Promise<void>;
  disabled?: boolean;
}

export function MigrationButton({ onMigrate, disabled }: MigrationButtonProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleMigration = async () => {
    if (!onMigrate) return;
    setShowConfirmDialog(false);
    setIsRunning(true);
    try {
      await onMigrate();
      setResult({ success: true, message: "Migration completed successfully!" });
    } catch (error) {
      setResult({ success: false, message: `Migration failed: ${error}` });
    } finally {
      setIsRunning(false);
      setShowResultDialog(true);
    }
  };

  return (
    <>
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" disabled={disabled || isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Migrating...
              </>
            ) : (
              "Run Migration"
            )}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Migration</DialogTitle>
            <DialogDescription>
              Are you sure you want to run this migration? This may take a while.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMigration}>
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {result?.success ? "Migration Complete" : "Migration Failed"}
            </DialogTitle>
            <DialogDescription>
              {result?.message}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowResultDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 