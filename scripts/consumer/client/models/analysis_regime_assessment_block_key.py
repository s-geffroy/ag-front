from enum import Enum

class AnalysisRegimeAssessmentBlockKey(str, Enum):
    REGIME_ASSESSMENT = "regime_assessment"

    def __str__(self) -> str:
        return str(self.value)
