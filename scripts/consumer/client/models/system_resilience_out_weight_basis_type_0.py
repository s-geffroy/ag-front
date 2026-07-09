from enum import Enum

class SystemResilienceOutWeightBasisType0(str, Enum):
    STRENGTH_PROXY = "strength_proxy"
    THROUGHPUT = "throughput"

    def __str__(self) -> str:
        return str(self.value)
