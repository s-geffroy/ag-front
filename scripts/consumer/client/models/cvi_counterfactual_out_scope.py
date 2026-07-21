from enum import Enum

class CviCounterfactualOutScope(str, Enum):
    BULK = "bulk"
    CORE = "core"

    def __str__(self) -> str:
        return str(self.value)
