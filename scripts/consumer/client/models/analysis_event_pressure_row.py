from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="AnalysisEventPressureRow")



@_attrs_define
class AnalysisEventPressureRow:
    """ One `event_pressure` row (`analytics.event_pressure_result`).

        Attributes:
            pressure_score (Union[None, Unset, float]):
            signal_count (Union[None, Unset, int]):
            top_domain (Union[None, Unset, str]):
            by_domain (Union[Any, None, Unset]):
     """

    pressure_score: Union[None, Unset, float] = UNSET
    signal_count: Union[None, Unset, int] = UNSET
    top_domain: Union[None, Unset, str] = UNSET
    by_domain: Union[Any, None, Unset] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        pressure_score: Union[None, Unset, float]
        if isinstance(self.pressure_score, Unset):
            pressure_score = UNSET
        else:
            pressure_score = self.pressure_score

        signal_count: Union[None, Unset, int]
        if isinstance(self.signal_count, Unset):
            signal_count = UNSET
        else:
            signal_count = self.signal_count

        top_domain: Union[None, Unset, str]
        if isinstance(self.top_domain, Unset):
            top_domain = UNSET
        else:
            top_domain = self.top_domain

        by_domain: Union[Any, None, Unset]
        if isinstance(self.by_domain, Unset):
            by_domain = UNSET
        else:
            by_domain = self.by_domain


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if pressure_score is not UNSET:
            field_dict["pressure_score"] = pressure_score
        if signal_count is not UNSET:
            field_dict["signal_count"] = signal_count
        if top_domain is not UNSET:
            field_dict["top_domain"] = top_domain
        if by_domain is not UNSET:
            field_dict["by_domain"] = by_domain

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        def _parse_pressure_score(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        pressure_score = _parse_pressure_score(d.pop("pressure_score", UNSET))


        def _parse_signal_count(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        signal_count = _parse_signal_count(d.pop("signal_count", UNSET))


        def _parse_top_domain(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        top_domain = _parse_top_domain(d.pop("top_domain", UNSET))


        def _parse_by_domain(data: object) -> Union[Any, None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[Any, None, Unset], data)

        by_domain = _parse_by_domain(d.pop("by_domain", UNSET))


        analysis_event_pressure_row = cls(
            pressure_score=pressure_score,
            signal_count=signal_count,
            top_domain=top_domain,
            by_domain=by_domain,
        )


        analysis_event_pressure_row.additional_properties = d
        return analysis_event_pressure_row

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
