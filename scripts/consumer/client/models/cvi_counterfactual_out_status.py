from enum import Enum

class CviCounterfactualOutStatus(str, Enum):
    CANDIDATE = "candidate"

    def __str__(self) -> str:
        return str(self.value)
