from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="SfuDimensionOut")



@_attrs_define
class SfuDimensionOut:
    """ 
        Attributes:
            dimension (str):
            effective_score (Union[None, Unset, float]):
            auto_value (Union[None, Unset, float]):
            analyst_value (Union[None, Unset, float]):
            confidence (Union[None, Unset, str]):
            evidence_status (Union[None, Unset, str]):
            rationale (Union[None, Unset, str]):
            origin (Union[None, Unset, str]):
     """

    dimension: str
    effective_score: Union[None, Unset, float] = UNSET
    auto_value: Union[None, Unset, float] = UNSET
    analyst_value: Union[None, Unset, float] = UNSET
    confidence: Union[None, Unset, str] = UNSET
    evidence_status: Union[None, Unset, str] = UNSET
    rationale: Union[None, Unset, str] = UNSET
    origin: Union[None, Unset, str] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        dimension = self.dimension

        effective_score: Union[None, Unset, float]
        if isinstance(self.effective_score, Unset):
            effective_score = UNSET
        else:
            effective_score = self.effective_score

        auto_value: Union[None, Unset, float]
        if isinstance(self.auto_value, Unset):
            auto_value = UNSET
        else:
            auto_value = self.auto_value

        analyst_value: Union[None, Unset, float]
        if isinstance(self.analyst_value, Unset):
            analyst_value = UNSET
        else:
            analyst_value = self.analyst_value

        confidence: Union[None, Unset, str]
        if isinstance(self.confidence, Unset):
            confidence = UNSET
        else:
            confidence = self.confidence

        evidence_status: Union[None, Unset, str]
        if isinstance(self.evidence_status, Unset):
            evidence_status = UNSET
        else:
            evidence_status = self.evidence_status

        rationale: Union[None, Unset, str]
        if isinstance(self.rationale, Unset):
            rationale = UNSET
        else:
            rationale = self.rationale

        origin: Union[None, Unset, str]
        if isinstance(self.origin, Unset):
            origin = UNSET
        else:
            origin = self.origin


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "dimension": dimension,
        })
        if effective_score is not UNSET:
            field_dict["effective_score"] = effective_score
        if auto_value is not UNSET:
            field_dict["auto_value"] = auto_value
        if analyst_value is not UNSET:
            field_dict["analyst_value"] = analyst_value
        if confidence is not UNSET:
            field_dict["confidence"] = confidence
        if evidence_status is not UNSET:
            field_dict["evidence_status"] = evidence_status
        if rationale is not UNSET:
            field_dict["rationale"] = rationale
        if origin is not UNSET:
            field_dict["origin"] = origin

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        dimension = d.pop("dimension")

        def _parse_effective_score(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        effective_score = _parse_effective_score(d.pop("effective_score", UNSET))


        def _parse_auto_value(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        auto_value = _parse_auto_value(d.pop("auto_value", UNSET))


        def _parse_analyst_value(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        analyst_value = _parse_analyst_value(d.pop("analyst_value", UNSET))


        def _parse_confidence(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        confidence = _parse_confidence(d.pop("confidence", UNSET))


        def _parse_evidence_status(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        evidence_status = _parse_evidence_status(d.pop("evidence_status", UNSET))


        def _parse_rationale(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        rationale = _parse_rationale(d.pop("rationale", UNSET))


        def _parse_origin(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        origin = _parse_origin(d.pop("origin", UNSET))


        sfu_dimension_out = cls(
            dimension=dimension,
            effective_score=effective_score,
            auto_value=auto_value,
            analyst_value=analyst_value,
            confidence=confidence,
            evidence_status=evidence_status,
            rationale=rationale,
            origin=origin,
        )


        sfu_dimension_out.additional_properties = d
        return sfu_dimension_out

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
