from enum import Enum

class AnalysisWeaponizabilityBlockKey(str, Enum):
    WEAPONIZABILITY = "weaponizability"

    def __str__(self) -> str:
        return str(self.value)
