from enum import Enum

class NewsSourceRefCountrySource(str, Enum):
    REGISTRY = "registry"
    UNKNOWN = "unknown"

    def __str__(self) -> str:
        return str(self.value)
