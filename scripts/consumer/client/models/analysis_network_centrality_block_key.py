from enum import Enum

class AnalysisNetworkCentralityBlockKey(str, Enum):
    NETWORK_CENTRALITY = "network_centrality"

    def __str__(self) -> str:
        return str(self.value)
