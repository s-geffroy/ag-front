from enum import Enum

class AnalysisRiskStateBlockKey(str, Enum):
    RISK_STATE = "risk_state"

    def __str__(self) -> str:
        return str(self.value)
