"use client";

import {
  updateMemeTypes,
  fixMemeTypes,
  migrateToNumericChunks,
  migrateVoteFields,
} from "@/lib/firebase-utils";
import { MigrationButton } from "@/components/admin/MigrationButton";

export default function AdminPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Migrations</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Update Meme Types</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Legacy migration: Updates meme types in the database.
              </p>
              <MigrationButton onMigrate={updateMemeTypes} disabled={true} />
            </div>

            <div>
              <h3 className="font-medium mb-2">Fix Meme Types</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Legacy migration: Fixes incorrect meme types in the database.
              </p>
              <MigrationButton onMigrate={fixMemeTypes} disabled={true} />
            </div>

            <div>
              <h3 className="font-medium mb-2">Chunk Migration</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Legacy migration: Migrate existing memes to the new chunk-based
                system.
              </p>
              <MigrationButton disabled />
            </div>

            <div>
              <h3 className="font-medium mb-2">Numeric Chunk IDs</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Convert chunk IDs to sequential numbers for better URL
                structure.
              </p>
              <MigrationButton onMigrate={migrateToNumericChunks} disabled={true}/>
            </div>

            <div>
              <h3 className="font-medium mb-2">Vote Fields Migration</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Add netVotes and totalVotes fields for improved sorting capabilities.
              </p>
              <MigrationButton onMigrate={migrateVoteFields} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
