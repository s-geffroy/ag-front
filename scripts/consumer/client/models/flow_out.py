from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="FlowOut")



@_attrs_define
class FlowOut:
    """ 
        Attributes:
            flow_type (str):
            importance_score (Union[None, Unset, int]):
            estimated_volume (Union[None, Unset, float]):
            volume_unit (Union[None, Unset, str]):
            volume_year (Union[None, Unset, int]):
            value_status (Union[None, Unset, str]):
            directionality (Union[None, Unset, str]):
            source_confidence (Union[None, Unset, str]):
            method_note (Union[None, Unset, str]):
            sources (Union[Unset, list[str]]):
     """

    flow_type: str
    importance_score: Union[None, Unset, int] = UNSET
    estimated_volume: Union[None, Unset, float] = UNSET
    volume_unit: Union[None, Unset, str] = UNSET
    volume_year: Union[None, Unset, int] = UNSET
    value_status: Union[None, Unset, str] = UNSET
    directionality: Union[None, Unset, str] = UNSET
    source_confidence: Union[None, Unset, str] = UNSET
    method_note: Union[None, Unset, str] = UNSET
    sources: Union[Unset, list[str]] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        flow_type = self.flow_type

        importance_score: Union[None, Unset, int]
        if isinstance(self.importance_score, Unset):
            importance_score = UNSET
        else:
            importance_score = self.importance_score

        estimated_volume: Union[None, Unset, float]
        if isinstance(self.estimated_volume, Unset):
            estimated_volume = UNSET
        else:
            estimated_volume = self.estimated_volume

        volume_unit: Union[None, Unset, str]
        if isinstance(self.volume_unit, Unset):
            volume_unit = UNSET
        else:
            volume_unit = self.volume_unit

        volume_year: Union[None, Unset, int]
        if isinstance(self.volume_year, Unset):
            volume_year = UNSET
        else:
            volume_year = self.volume_year

        value_status: Union[None, Unset, str]
        if isinstance(self.value_status, Unset):
            value_status = UNSET
        else:
            value_status = self.value_status

        directionality: Union[None, Unset, str]
        if isinstance(self.directionality, Unset):
            directionality = UNSET
        else:
            directionality = self.directionality

        source_confidence: Union[None, Unset, str]
        if isinstance(self.source_confidence, Unset):
            source_confidence = UNSET
        else:
            source_confidence = self.source_confidence

        method_note: Union[None, Unset, str]
        if isinstance(self.method_note, Unset):
            method_note = UNSET
        else:
            method_note = self.method_note

        sources: Union[Unset, list[str]] = UNSET
        if not isinstance(self.sources, Unset):
            sources = self.sources




        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "flow_type": flow_type,
        })
        if importance_score is not UNSET:
            field_dict["importance_score"] = importance_score
        if estimated_volume is not UNSET:
            field_dict["estimated_volume"] = estimated_volume
        if volume_unit is not UNSET:
            field_dict["volume_unit"] = volume_unit
        if volume_year is not UNSET:
            field_dict["volume_year"] = volume_year
        if value_status is not UNSET:
            field_dict["value_status"] = value_status
        if directionality is not UNSET:
            field_dict["directionality"] = directionality
        if source_confidence is not UNSET:
            field_dict["source_confidence"] = source_confidence
        if method_note is not UNSET:
            field_dict["method_note"] = method_note
        if sources is not UNSET:
            field_dict["sources"] = sources

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        flow_type = d.pop("flow_type")

        def _parse_importance_score(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        importance_score = _parse_importance_score(d.pop("importance_score", UNSET))


        def _parse_estimated_volume(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        estimated_volume = _parse_estimated_volume(d.pop("estimated_volume", UNSET))


        def _parse_volume_unit(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        volume_unit = _parse_volume_unit(d.pop("volume_unit", UNSET))


        def _parse_volume_year(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        volume_year = _parse_volume_year(d.pop("volume_year", UNSET))


        def _parse_value_status(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        value_status = _parse_value_status(d.pop("value_status", UNSET))


        def _parse_directionality(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        directionality = _parse_directionality(d.pop("directionality", UNSET))


        def _parse_source_confidence(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        source_confidence = _parse_source_confidence(d.pop("source_confidence", UNSET))


        def _parse_method_note(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        method_note = _parse_method_note(d.pop("method_note", UNSET))


        sources = cast(list[str], d.pop("sources", UNSET))


        flow_out = cls(
            flow_type=flow_type,
            importance_score=importance_score,
            estimated_volume=estimated_volume,
            volume_unit=volume_unit,
            volume_year=volume_year,
            value_status=value_status,
            directionality=directionality,
            source_confidence=source_confidence,
            method_note=method_note,
            sources=sources,
        )


        flow_out.additional_properties = d
        return flow_out

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
