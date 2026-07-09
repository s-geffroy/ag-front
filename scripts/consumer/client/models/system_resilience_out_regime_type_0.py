from enum import Enum

class SystemResilienceOutRegimeType0(str, Enum):
    BRITTLE = "brittle"
    REDUNDANT = "redundant"
    WINDOW_OF_VITALITY = "window_of_vitality"

    def __str__(self) -> str:
        return str(self.value)
