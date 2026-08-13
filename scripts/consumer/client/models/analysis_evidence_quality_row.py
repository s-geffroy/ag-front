from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="AnalysisEvidenceQualityRow")



@_attrs_define
class AnalysisEvidenceQualityRow:
    """ One `evidence_quality` row (`analytics.evidence_quality_result`).

        Attributes:
            evidence_score (Union[None, Unset, int]):
            source_count (Union[None, Unset, int]):
            high_quality_source_count (Union[None, Unset, int]):
            license_risk (Union[None, Unset, str]):
            missing_evidence_flags (Union[None, Unset, list[str]]):
     """

    evidence_score: Union[None, Unset, int] = UNSET
    source_count: Union[None, Unset, int] = UNSET
    high_quality_source_count: Union[None, Unset, int] = UNSET
    license_risk: Union[None, Unset, str] = UNSET
    missing_evidence_flags: Union[None, Unset, list[str]] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        evidence_score: Union[None, Unset, int]
        if isinstance(self.evidence_score, Unset):
            evidence_score = UNSET
        else:
            evidence_score = self.evidence_score

        source_count: Union[None, Unset, int]
        if isinstance(self.source_count, Unset):
            source_count = UNSET
        else:
            source_count = self.source_count

        high_quality_source_count: Union[None, Unset, int]
        if isinstance(self.high_quality_source_count, Unset):
            high_quality_source_count = UNSET
        else:
            high_quality_source_count = self.high_quality_source_count

        license_risk: Union[None, Unset, str]
        if isinstance(self.license_risk, Unset):
            license_risk = UNSET
        else:
            license_risk = self.license_risk

        missing_evidence_flags: Union[None, Unset, list[str]]
        if isinstance(self.missing_evidence_flags, Unset):
            missing_evidence_flags = UNSET
        elif isinstance(self.missing_evidence_flags, list):
            missing_evidence_flags = self.missing_evidence_flags


        else:
            missing_evidence_flags = self.missing_evidence_flags


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if evidence_score is not UNSET:
            field_dict["evidence_score"] = evidence_score
        if source_count is not UNSET:
            field_dict["source_count"] = source_count
        if high_quality_source_count is not UNSET:
            field_dict["high_quality_source_count"] = high_quality_source_count
        if license_risk is not UNSET:
            field_dict["license_risk"] = license_risk
        if missing_evidence_flags is not UNSET:
            field_dict["missing_evidence_flags"] = missing_evidence_flags

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        def _parse_evidence_score(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        evidence_score = _parse_evidence_score(d.pop("evidence_score", UNSET))


        def _parse_source_count(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        source_count = _parse_source_count(d.pop("source_count", UNSET))


        def _parse_high_quality_source_count(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        high_quality_source_count = _parse_high_quality_source_count(d.pop("high_quality_source_count", UNSET))


        def _parse_license_risk(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        license_risk = _parse_license_risk(d.pop("license_risk", UNSET))


        def _parse_missing_evidence_flags(data: object) -> Union[None, Unset, list[str]]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                missing_evidence_flags_type_0 = cast(list[str], data)

                return missing_evidence_flags_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, Unset, list[str]], data)

        missing_evidence_flags = _parse_missing_evidence_flags(d.pop("missing_evidence_flags", UNSET))


        analysis_evidence_quality_row = cls(
            evidence_score=evidence_score,
            source_count=source_count,
            high_quality_source_count=high_quality_source_count,
            license_risk=license_risk,
            missing_evidence_flags=missing_evidence_flags,
        )


        analysis_evidence_quality_row.additional_properties = d
        return analysis_evidence_quality_row

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
