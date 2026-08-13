from enum import Enum

class AnalysisCorroborationBlockKey(str, Enum):
    CORROBORATION = "corroboration"

    def __str__(self) -> str:
        return str(self.value)
