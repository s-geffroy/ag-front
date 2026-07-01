from enum import Enum

class ListChokepointsChokepointsGetPriorityClassType0(str, Enum):
    P0 = "P0"
    P1 = "P1"
    P2 = "P2"
    P3 = "P3"

    def __str__(self) -> str:
        return str(self.value)
