import asyncio
import time
from collections import defaultdict
from typing import Tuple

from fastapi import Request


class RateLimitService:
    REGISTRATION_LIMIT = 3
    REGISTRATION_WINDOW_SECONDS = 60 * 60

    STORY_CREATION_LIMIT = 3
    STORY_CREATION_WINDOW_SECONDS = 24 * 60 * 60

    PASSAGE_CREATION_LIMIT = 30
    PASSAGE_CREATION_WINDOW_SECONDS = 24 * 60 * 60

    def __init__(self):
        self._lock = asyncio.Lock()
        self._registration_attempts: dict[str, list[float]] = defaultdict(list)
        self._story_attempts: dict[int, list[float]] = defaultdict(list)
        self._passage_attempts: dict[int, list[float]] = defaultdict(list)

    @staticmethod
    def get_client_ip(request: Request) -> str:
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()

        if request.client and request.client.host:
            return request.client.host

        return "unknown"

    @staticmethod
    def _prune_old_attempts(attempts: list[float], window_seconds: int) -> list[float]:
        now = time.time()
        threshold = now - window_seconds
        return [timestamp for timestamp in attempts if timestamp > threshold]

    @staticmethod
    def _get_retry_after(attempts: list[float], window_seconds: int) -> int:
        if not attempts:
            return window_seconds
        oldest = min(attempts)
        retry_after = int(oldest + window_seconds - time.time())
        return max(retry_after, 1)

    async def _check_rate_limit(
        self,
        bucket: list[float],
        limit: int,
        window_seconds: int,
    ) -> Tuple[bool, int]:
        now = time.time()
        bucket[:] = [
            timestamp for timestamp in bucket if timestamp > now - window_seconds
        ]

        if len(bucket) >= limit:
            return False, self._get_retry_after(bucket, window_seconds)

        bucket.append(now)
        return True, 0

    async def check_registration_limit(self, ip_address: str) -> Tuple[bool, int]:
        async with self._lock:
            return await self._check_rate_limit(
                self._registration_attempts[ip_address],
                self.REGISTRATION_LIMIT,
                self.REGISTRATION_WINDOW_SECONDS,
            )

    async def check_story_creation_limit(self, user_id: int) -> Tuple[bool, int]:
        async with self._lock:
            return await self._check_rate_limit(
                self._story_attempts[user_id],
                self.STORY_CREATION_LIMIT,
                self.STORY_CREATION_WINDOW_SECONDS,
            )

    async def check_passage_creation_limit(self, user_id: int) -> Tuple[bool, int]:
        async with self._lock:
            return await self._check_rate_limit(
                self._passage_attempts[user_id],
                self.PASSAGE_CREATION_LIMIT,
                self.PASSAGE_CREATION_WINDOW_SECONDS,
            )


rate_limiter = RateLimitService()
