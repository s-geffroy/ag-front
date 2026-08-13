from enum import Enum

class AnalysisSystemCascadeBlockKey(str, Enum):
    SYSTEM_CASCADE = "system_cascade"

    def __str__(self) -> str:
        return str(self.value)
