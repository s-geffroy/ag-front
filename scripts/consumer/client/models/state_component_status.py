from enum import Enum

class StateComponentStatus(str, Enum):
    NO_DATA = "no_data"
    OBSERVED = "observed"
    STALE = "stale"

    def __str__(self) -> str:
        return str(self.value)
