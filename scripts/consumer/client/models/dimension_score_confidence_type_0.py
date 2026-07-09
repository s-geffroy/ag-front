from enum import Enum

class DimensionScoreConfidenceType0(str, Enum):
    BAS = "bas"
    ELEVE = "eleve"
    MOYEN = "moyen"

    def __str__(self) -> str:
        return str(self.value)
