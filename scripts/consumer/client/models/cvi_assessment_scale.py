from enum import Enum

class CviAssessmentScale(str, Enum):
    QUALITATIVE = "qualitative"
    VALUE_1 = "0-5"
    VALUE_2 = "0-100"

    def __str__(self) -> str:
        return str(self.value)
