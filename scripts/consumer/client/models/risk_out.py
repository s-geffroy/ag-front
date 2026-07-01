from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="RiskOut")



@_attrs_define
class RiskOut:
    """ 
        Attributes:
            risk_type (str):
            probability_score (Union[None, Unset, int]):
            impact_score (Union[None, Unset, int]):
            vulnerability_score (Union[None, Unset, int]):
            current_status (Union[None, Unset, str]):
            triggers (Union[Unset, list[str]]):
            affected_flows (Union[Unset, list[str]]):
     """

    risk_type: str
    probability_score: Union[None, Unset, int] = UNSET
    impact_score: Union[None, Unset, int] = UNSET
    vulnerability_score: Union[None, Unset, int] = UNSET
    current_status: Union[None, Unset, str] = UNSET
    triggers: Union[Unset, list[str]] = UNSET
    affected_flows: Union[Unset, list[str]] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        risk_type = self.risk_type

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

        current_status: Union[None, Unset, str]
        if isinstance(self.current_status, Unset):
            current_status = UNSET
        else:
            current_status = self.current_status

        triggers: Union[Unset, list[str]] = UNSET
        if not isinstance(self.triggers, Unset):
            triggers = self.triggers



        affected_flows: Union[Unset, list[str]] = UNSET
        if not isinstance(self.affected_flows, Unset):
            affected_flows = self.affected_flows




        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "risk_type": risk_type,
        })
        if probability_score is not UNSET:
            field_dict["probability_score"] = probability_score
        if impact_score is not UNSET:
            field_dict["impact_score"] = impact_score
        if vulnerability_score is not UNSET:
            field_dict["vulnerability_score"] = vulnerability_score
        if current_status is not UNSET:
            field_dict["current_status"] = current_status
        if triggers is not UNSET:
            field_dict["triggers"] = triggers
        if affected_flows is not UNSET:
            field_dict["affected_flows"] = affected_flows

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        risk_type = d.pop("risk_type")

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


        def _parse_current_status(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        current_status = _parse_current_status(d.pop("current_status", UNSET))


        triggers = cast(list[str], d.pop("triggers", UNSET))


        affected_flows = cast(list[str], d.pop("affected_flows", UNSET))


        risk_out = cls(
            risk_type=risk_type,
            probability_score=probability_score,
            impact_score=impact_score,
            vulnerability_score=vulnerability_score,
            current_status=current_status,
            triggers=triggers,
            affected_flows=affected_flows,
        )


        risk_out.additional_properties = d
        return risk_out

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
