from enum import Enum

class CviAssessmentGlobalLevelType0(str, Enum):
    BAS = "bas"
    CRITIQUE = "critique"
    ELEVE = "eleve"
    MODERE = "modere"

    def __str__(self) -> str:
        return str(self.value)
