from enum import Enum

class AnalysisSubstitutionScoreBlockKey(str, Enum):
    SUBSTITUTION_SCORE = "substitution_score"

    def __str__(self) -> str:
        return str(self.value)
