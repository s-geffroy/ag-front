from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="AnalysisRiskStateRow")



@_attrs_define
class AnalysisRiskStateRow:
    """ One `risk_state` row (`analytics.risk_state_result`).

        Attributes:
            risk_family (Union[None, Unset, str]):
            assessment_status (Union[None, Unset, str]):
            risk_severity (Union[None, Unset, str]):
            probability_score (Union[None, Unset, int]):
            impact_score (Union[None, Unset, int]):
            vulnerability_score (Union[None, Unset, int]):
            triggers (Union[None, Unset, list[str]]):
     """

    risk_family: Union[None, Unset, str] = UNSET
    assessment_status: Union[None, Unset, str] = UNSET
    risk_severity: Union[None, Unset, str] = UNSET
    probability_score: Union[None, Unset, int] = UNSET
    impact_score: Union[None, Unset, int] = UNSET
    vulnerability_score: Union[None, Unset, int] = UNSET
    triggers: Union[None, Unset, list[str]] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        risk_family: Union[None, Unset, str]
        if isinstance(self.risk_family, Unset):
            risk_family = UNSET
        else:
            risk_family = self.risk_family

        assessment_status: Union[None, Unset, str]
        if isinstance(self.assessment_status, Unset):
            assessment_status = UNSET
        else:
            assessment_status = self.assessment_status

        risk_severity: Union[None, Unset, str]
        if isinstance(self.risk_severity, Unset):
            risk_severity = UNSET
        else:
            risk_severity = self.risk_severity

        probability_score: Union[None, Unset, int]
        if isinstance(self.probability_score, Unset):
            probability_score = UNSET
        else:
            probability_score = self.probability_score

        impact_score: Union[None, Unset, int]
        if isinstance(self.impact_score, Unset):
            impact_score = UNSET
        else:
            impact_score = self.impact_score

        vulnerability_score: Union[None, Unset, int]
        if isinstance(self.vulnerability_score, Unset):
            vulnerability_score = UNSET
        else:
            vulnerability_score = self.vulnerability_score

        triggers: Union[None, Unset, list[str]]
        if isinstance(self.triggers, Unset):
            triggers = UNSET
        elif isinstance(self.triggers, list):
            triggers = self.triggers


        else:
            triggers = self.triggers


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if risk_family is not UNSET:
            field_dict["risk_family"] = risk_family
        if assessment_status is not UNSET:
            field_dict["assessment_status"] = assessment_status
        if risk_severity is not UNSET:
            field_dict["risk_severity"] = risk_severity
        if probability_score is not UNSET:
            field_dict["probability_score"] = probability_score
        if impact_score is not UNSET:
            field_dict["impact_score"] = impact_score
        if vulnerability_score is not UNSET:
            field_dict["vulnerability_score"] = vulnerability_score
        if triggers is not UNSET:
            field_dict["triggers"] = triggers

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        def _parse_risk_family(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        risk_family = _parse_risk_family(d.pop("risk_family", UNSET))


        def _parse_assessment_status(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        assessment_status = _parse_assessment_status(d.pop("assessment_status", UNSET))


        def _parse_risk_severity(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        risk_severity = _parse_risk_severity(d.pop("risk_severity", UNSET))


        def _parse_probability_score(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        probability_score = _parse_probability_score(d.pop("probability_score", UNSET))


        def _parse_impact_score(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        impact_score = _parse_impact_score(d.pop("impact_score", UNSET))


        def _parse_vulnerability_score(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        vulnerability_score = _parse_vulnerability_score(d.pop("vulnerability_score", UNSET))


        def _parse_triggers(data: object) -> Union[None, Unset, list[str]]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                triggers_type_0 = cast(list[str], data)

                return triggers_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, Unset, list[str]], data)

        triggers = _parse_triggers(d.pop("triggers", UNSET))


        analysis_risk_state_row = cls(
            risk_family=risk_family,
            assessment_status=assessment_status,
            risk_severity=risk_severity,
            probability_score=probability_score,
            impact_score=impact_score,
            vulnerability_score=vulnerability_score,
            triggers=triggers,
        )


        analysis_risk_state_row.additional_properties = d
        return analysis_risk_state_row

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
