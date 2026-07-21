from enum import Enum

class CviCounterfactualOutScale(str, Enum):
    VALUE_0 = "0-5"

    def __str__(self) -> str:
        return str(self.value)
