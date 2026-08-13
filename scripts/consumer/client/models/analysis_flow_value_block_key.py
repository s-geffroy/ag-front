from enum import Enum

class AnalysisFlowValueBlockKey(str, Enum):
    FLOW_VALUE = "flow_value"

    def __str__(self) -> str:
        return str(self.value)
