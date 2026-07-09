from enum import Enum

class CviAssessmentStatus(str, Enum):
    CANDIDATE = "candidate"
    PARTIALLY_VALIDATED = "partially_validated"
    VALIDATED = "validated"

    def __str__(self) -> str:
        return str(self.value)
