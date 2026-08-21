from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from dateutil.parser import isoparse
from typing import cast
from typing import cast, Union
from typing import Union
import datetime

if TYPE_CHECKING:
  from ..models.perception_consensus_out import PerceptionConsensusOut





T = TypeVar("T", bound="PredictionConsensusList")



@_attrs_define
class PredictionConsensusList:
    """ The derived Polymarket consensus for one object, served at the clear `read` token (the narrow,
    redistributable surface). `consensus` is empty when the object has no named/implied coverage, or
    when every family it does have rests on fewer than `minimum_market_count` markets.

        Attributes:
            returned (int):
            total_count (int):
            truncated (bool):
            generated_at (datetime.datetime):
            chokepoint_id (str):
            minimum_market_count (int):
            limit (Union[None, Unset, int]):
            consensus (Union[Unset, list['PerceptionConsensusOut']]):
            disclaimer (Union[Unset, str]):  Default: 'Polymarket P3 perception consensus (ADR 0037/0079): liquidity-
                weighted crowd anticipation, NOT event evidence. Derived candidate (not human-validated). Redistributable WITH
                Polymarket attribution; S5 low-reliability. Floored on named/implied attachment — an object with no honest
                market coverage returns an empty list. Floored on cardinality too (ADR 0087): a family resting on fewer than 2
                markets is NOT served here, because one quotation under a plural noun is not a consensus; see
                `minimum_market_count`. The refused rows stay visible on the internal read_tainted surface.'.
     """

    returned: int
    total_count: int
    truncated: bool
    generated_at: datetime.datetime
    chokepoint_id: str
    minimum_market_count: int
    limit: Union[None, Unset, int] = UNSET
    consensus: Union[Unset, list['PerceptionConsensusOut']] = UNSET
    disclaimer: Union[Unset, str] = 'Polymarket P3 perception consensus (ADR 0037/0079): liquidity-weighted crowd anticipation, NOT event evidence. Derived candidate (not human-validated). Redistributable WITH Polymarket attribution; S5 low-reliability. Floored on named/implied attachment — an object with no honest market coverage returns an empty list. Floored on cardinality too (ADR 0087): a family resting on fewer than 2 markets is NOT served here, because one quotation under a plural noun is not a consensus; see `minimum_market_count`. The refused rows stay visible on the internal read_tainted surface.'
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        from ..models.perception_consensus_out import PerceptionConsensusOut
        returned = self.returned

        total_count = self.total_count

        truncated = self.truncated

        generated_at = self.generated_at.isoformat()

        chokepoint_id = self.chokepoint_id

        minimum_market_count = self.minimum_market_count

        limit: Union[None, Unset, int]
        if isinstance(self.limit, Unset):
            limit = UNSET
        else:
            limit = self.limit

        consensus: Union[Unset, list[dict[str, Any]]] = UNSET
        if not isinstance(self.consensus, Unset):
            consensus = []
            for consensus_item_data in self.consensus:
                consensus_item = consensus_item_data.to_dict()
                consensus.append(consensus_item)



        disclaimer = self.disclaimer


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "returned": returned,
            "total_count": total_count,
            "truncated": truncated,
            "generated_at": generated_at,
            "chokepoint_id": chokepoint_id,
            "minimum_market_count": minimum_market_count,
        })
        if limit is not UNSET:
            field_dict["limit"] = limit
        if consensus is not UNSET:
            field_dict["consensus"] = consensus
        if disclaimer is not UNSET:
            field_dict["disclaimer"] = disclaimer

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.perception_consensus_out import PerceptionConsensusOut
        d = dict(src_dict)
        returned = d.pop("returned")

        total_count = d.pop("total_count")

        truncated = d.pop("truncated")

        generated_at = isoparse(d.pop("generated_at"))




        chokepoint_id = d.pop("chokepoint_id")

        minimum_market_count = d.pop("minimum_market_count")

        def _parse_limit(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        limit = _parse_limit(d.pop("limit", UNSET))


        consensus = []
        _consensus = d.pop("consensus", UNSET)
        for consensus_item_data in (_consensus or []):
            consensus_item = PerceptionConsensusOut.from_dict(consensus_item_data)



            consensus.append(consensus_item)


        disclaimer = d.pop("disclaimer", UNSET)

        prediction_consensus_list = cls(
            returned=returned,
            total_count=total_count,
            truncated=truncated,
            generated_at=generated_at,
            chokepoint_id=chokepoint_id,
            minimum_market_count=minimum_market_count,
            limit=limit,
            consensus=consensus,
            disclaimer=disclaimer,
        )


        prediction_consensus_list.additional_properties = d
        return prediction_consensus_list

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
