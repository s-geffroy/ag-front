from enum import Enum

class AnalysisControlConcentrationBlockKey(str, Enum):
    CONTROL_CONCENTRATION = "control_concentration"

    def __str__(self) -> str:
        return str(self.value)
