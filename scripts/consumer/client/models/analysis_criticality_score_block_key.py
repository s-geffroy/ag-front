from enum import Enum

class AnalysisCriticalityScoreBlockKey(str, Enum):
    CRITICALITY_SCORE = "criticality_score"

    def __str__(self) -> str:
        return str(self.value)
