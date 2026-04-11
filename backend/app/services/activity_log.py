import logging

logger = logging.getLogger("stories_together.activity")


def log_activity(
    action: str,
    ip_address: str,
    user_id: int | None = None,
    success: bool = True,
    detail: str | None = None,
) -> None:
    logger.info(
        "action=%s user_id=%s ip=%s success=%s detail=%s",
        action,
        user_id,
        ip_address,
        success,
        detail or "",
    )
