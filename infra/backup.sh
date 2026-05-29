#!/bin/bash
set -euo pipefail

BACKUP_DIR="/var/backups/noiseroom"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILE="$BACKUP_DIR/noiseroom_$TIMESTAMP.sql.gz"
KEEP_DAYS=7

mkdir -p "$BACKUP_DIR"

docker exec noiseroom-db-1 pg_dump -U noiseroom noiseroom | gzip > "$FILE"

find "$BACKUP_DIR" -name "noiseroom_*.sql.gz" -mtime +$KEEP_DAYS -delete

echo "backup saved: $FILE"
