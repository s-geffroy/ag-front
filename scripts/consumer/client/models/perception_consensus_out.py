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






T = TypeVar("T", bound="PerceptionConsensusOut")



@_attrs_define
class PerceptionConsensusOut:
    """ 
        Attributes:
            signal_family (Union[None, Unset, str]):
            market_count (Union[None, Unset, int]):
            consensus_probability (Union[None, Unset, float]):
            max_probability_change_24h (Union[None, Unset, float]):
            total_liquidity (Union[None, Unset, float]):
            observed_window_end (Union[None, Unset, datetime.datetime]):
     """

    signal_family: Union[None, Unset, str] = UNSET
    market_count: Union[None, Unset, int] = UNSET
    consensus_probability: Union[None, Unset, float] = UNSET
    max_probability_change_24h: Union[None, Unset, float] = UNSET
    total_liquidity: Union[None, Unset, float] = UNSET
    observed_window_end: Union[None, Unset, datetime.datetime] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        signal_family: Union[None, Unset, str]
        if isinstance(self.signal_family, Unset):
            signal_family = UNSET
        else:
            signal_family = self.signal_family

        market_count: Union[None, Unset, int]
        if isinstance(self.market_count, Unset):
            market_count = UNSET
        else:
            market_count = self.market_count

        consensus_probability: Union[None, Unset, float]
        if isinstance(self.consensus_probability, Unset):
            consensus_probability = UNSET
        else:
            consensus_probability = self.consensus_probability

        max_probability_change_24h: Union[None, Unset, float]
        if isinstance(self.max_probability_change_24h, Unset):
            max_probability_change_24h = UNSET
        else:
            max_probability_change_24h = self.max_probability_change_24h

        total_liquidity: Union[None, Unset, float]
        if isinstance(self.total_liquidity, Unset):
            total_liquidity = UNSET
        else:
            total_liquidity = self.total_liquidity

        observed_window_end: Union[None, Unset, str]
        if isinstance(self.observed_window_end, Unset):
            observed_window_end = UNSET
        elif isinstance(self.observed_window_end, datetime.datetime):
            observed_window_end = self.observed_window_end.isoformat()
        else:
            observed_window_end = self.observed_window_end


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if signal_family is not UNSET:
            field_dict["signal_family"] = signal_family
        if market_count is not UNSET:
            field_dict["market_count"] = market_count
        if consensus_probability is not UNSET:
            field_dict["consensus_probability"] = consensus_probability
        if max_probability_change_24h is not UNSET:
            field_dict["max_probability_change_24h"] = max_probability_change_24h
        if total_liquidity is not UNSET:
            field_dict["total_liquidity"] = total_liquidity
        if observed_window_end is not UNSET:
            field_dict["observed_window_end"] = observed_window_end

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        def _parse_signal_family(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        signal_family = _parse_signal_family(d.pop("signal_family", UNSET))


        def _parse_market_count(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        market_count = _parse_market_count(d.pop("market_count", UNSET))


        def _parse_consensus_probability(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        consensus_probability = _parse_consensus_probability(d.pop("consensus_probability", UNSET))


        def _parse_max_probability_change_24h(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        max_probability_change_24h = _parse_max_probability_change_24h(d.pop("max_probability_change_24h", UNSET))


        def _parse_total_liquidity(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        total_liquidity = _parse_total_liquidity(d.pop("total_liquidity", UNSET))


        def _parse_observed_window_end(data: object) -> Union[None, Unset, datetime.datetime]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                observed_window_end_type_0 = isoparse(data)



                return observed_window_end_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, Unset, datetime.datetime], data)

        observed_window_end = _parse_observed_window_end(d.pop("observed_window_end", UNSET))


        perception_consensus_out = cls(
            signal_family=signal_family,
            market_count=market_count,
            consensus_probability=consensus_probability,
            max_probability_change_24h=max_probability_change_24h,
            total_liquidity=total_liquidity,
            observed_window_end=observed_window_end,
        )


        perception_consensus_out.additional_properties = d
        return perception_consensus_out

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
