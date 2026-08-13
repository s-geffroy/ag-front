from enum import Enum

class AnalysisEventPressureBlockKey(str, Enum):
    EVENT_PRESSURE = "event_pressure"

    def __str__(self) -> str:
        return str(self.value)
