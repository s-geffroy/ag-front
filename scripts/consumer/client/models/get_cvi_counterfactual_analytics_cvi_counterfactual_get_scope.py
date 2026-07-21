from enum import Enum

class GetCviCounterfactualAnalyticsCviCounterfactualGetScope(str, Enum):
    BULK = "bulk"
    CORE = "core"

    def __str__(self) -> str:
        return str(self.value)
