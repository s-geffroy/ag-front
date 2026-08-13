from enum import Enum

class CviAssessmentBindingConfidenceType0(str, Enum):
    BAS = "bas"
    ELEVE = "eleve"
    MOYEN = "moyen"

    def __str__(self) -> str:
        return str(self.value)
