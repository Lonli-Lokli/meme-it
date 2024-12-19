import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UploadButton() {
  return (
    <Link href="/upload">
      <Button variant="outline" size="icon">
        <Plus className="h-4 w-4" />
        <span className="sr-only">Upload</span>
      </Button>
    </Link>
  );
} 