from enum import Enum

class AnalysisEvidenceQualityBlockKey(str, Enum):
    EVIDENCE_QUALITY = "evidence_quality"

    def __str__(self) -> str:
        return str(self.value)
