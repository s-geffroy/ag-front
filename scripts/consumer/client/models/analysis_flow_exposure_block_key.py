from enum import Enum

class AnalysisFlowExposureBlockKey(str, Enum):
    FLOW_EXPOSURE = "flow_exposure"

    def __str__(self) -> str:
        return str(self.value)
