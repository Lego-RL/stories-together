class StoriesTogetherException(Exception):
    """Base exception for app level exceptions"""

    pass


class EntityNotFoundException(StoriesTogetherException):
    def __init__(self, entity_name: str, entity_id: int):
        self.message = f"{entity_name} with id {entity_id} not found."
        self.status_code = 404


class UnauthorizedContributionException(StoriesTogetherException):
    def __init__(self, detail: str = "You are not authorized to add to this passage."):
        self.message = detail
        self.status_code = 403
