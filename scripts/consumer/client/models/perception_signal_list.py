from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast
from typing import Union

if TYPE_CHECKING:
  from ..models.perception_consensus_out import PerceptionConsensusOut
  from ..models.perception_signal_out import PerceptionSignalOut





T = TypeVar("T", bound="PerceptionSignalList")



@_attrs_define
class PerceptionSignalList:
    """ 
        Attributes:
            chokepoint_id (str):
            count (int):
            consensus (Union[Unset, list['PerceptionConsensusOut']]):
            signals (Union[Unset, list['PerceptionSignalOut']]):
            disclaimer (Union[Unset, str]):  Default: "P3 perception signals from prediction markets (Polymarket, ADR 0037):
                crowd anticipation, NOT event evidence. The source is uncleared (high license risk); this endpoint requires the
                'read_tainted' scope. Data never enters canonical without human validation.".
     """

    chokepoint_id: str
    count: int
    consensus: Union[Unset, list['PerceptionConsensusOut']] = UNSET
    signals: Union[Unset, list['PerceptionSignalOut']] = UNSET
    disclaimer: Union[Unset, str] = "P3 perception signals from prediction markets (Polymarket, ADR 0037): crowd anticipation, NOT event evidence. The source is uncleared (high license risk); this endpoint requires the 'read_tainted' scope. Data never enters canonical without human validation."
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        from ..models.perception_consensus_out import PerceptionConsensusOut
        from ..models.perception_signal_out import PerceptionSignalOut
        chokepoint_id = self.chokepoint_id

        count = self.count

        consensus: Union[Unset, list[dict[str, Any]]] = UNSET
        if not isinstance(self.consensus, Unset):
            consensus = []
            for consensus_item_data in self.consensus:
                consensus_item = consensus_item_data.to_dict()
                consensus.append(consensus_item)



        signals: Union[Unset, list[dict[str, Any]]] = UNSET
        if not isinstance(self.signals, Unset):
            signals = []
            for signals_item_data in self.signals:
                signals_item = signals_item_data.to_dict()
                signals.append(signals_item)



        disclaimer = self.disclaimer


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "chokepoint_id": chokepoint_id,
            "count": count,
        })
        if consensus is not UNSET:
            field_dict["consensus"] = consensus
        if signals is not UNSET:
            field_dict["signals"] = signals
        if disclaimer is not UNSET:
            field_dict["disclaimer"] = disclaimer

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.perception_consensus_out import PerceptionConsensusOut
        from ..models.perception_signal_out import PerceptionSignalOut
        d = dict(src_dict)
        chokepoint_id = d.pop("chokepoint_id")

        count = d.pop("count")

        consensus = []
        _consensus = d.pop("consensus", UNSET)
        for consensus_item_data in (_consensus or []):
            consensus_item = PerceptionConsensusOut.from_dict(consensus_item_data)



            consensus.append(consensus_item)


        signals = []
        _signals = d.pop("signals", UNSET)
        for signals_item_data in (_signals or []):
            signals_item = PerceptionSignalOut.from_dict(signals_item_data)



            signals.append(signals_item)


        disclaimer = d.pop("disclaimer", UNSET)

        perception_signal_list = cls(
            chokepoint_id=chokepoint_id,
            count=count,
            consensus=consensus,
            signals=signals,
            disclaimer=disclaimer,
        )


        perception_signal_list.additional_properties = d
        return perception_signal_list

    @property
    def additional_keys(self) -> list[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
