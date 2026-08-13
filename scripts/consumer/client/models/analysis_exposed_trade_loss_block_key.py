from enum import Enum

class AnalysisExposedTradeLossBlockKey(str, Enum):
    EXPOSED_TRADE_LOSS = "exposed_trade_loss"

    def __str__(self) -> str:
        return str(self.value)
