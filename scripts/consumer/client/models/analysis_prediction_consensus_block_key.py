from enum import Enum

class AnalysisPredictionConsensusBlockKey(str, Enum):
    PREDICTION_CONSENSUS = "prediction_consensus"

    def __str__(self) -> str:
        return str(self.value)
