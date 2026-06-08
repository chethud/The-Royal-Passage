from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import AuditLogEntry


def log_audit(
    actor_id: str | None,
    action: str,
    entity_type: str,
    entity_id: str | None = None,
    metadata: dict | None = None,
) -> None:
    supabase = get_supabase_admin()
    supabase.table("audit_logs").insert(
        {
            "actor_id": actor_id,
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "metadata": metadata or {},
        }
    ).execute()


def list_recent_audit_logs(limit: int = 20) -> list[AuditLogEntry]:
    supabase = get_supabase_admin()
    result = (
        supabase.table("audit_logs")
        .select("id, action, entity_type, entity_id, metadata, created_at, profiles ( full_name )")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )

    entries = []
    for row in result.data or []:
        profile = row.get("profiles") or {}
        entries.append(
            AuditLogEntry(
                id=row["id"],
                action=row["action"],
                entityType=row["entity_type"],
                entityId=row.get("entity_id"),
                actorName=profile.get("full_name"),
                metadata=row.get("metadata") or {},
                createdAt=row.get("created_at", ""),
            )
        )
    return entries
