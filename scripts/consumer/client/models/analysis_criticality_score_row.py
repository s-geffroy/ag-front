from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="AnalysisCriticalityScoreRow")



@_attrs_define
class AnalysisCriticalityScoreRow:
    """ One `criticality_score` row (`analytics.criticality_score_result`).

        Attributes:
            flow_volume_score (Union[None, Unset, int]):
            substitution_difficulty_score (Union[None, Unset, int]):
            infrastructure_fragility_score (Union[None, Unset, int]):
            geopolitical_risk_score (Union[None, Unset, int]):
            economic_cascade_score (Union[None, Unset, int]):
            source_confidence_score (Union[None, Unset, int]):
            proposed_priority_class (Union[None, Unset, str]):
     """

    flow_volume_score: Union[None, Unset, int] = UNSET
    substitution_difficulty_score: Union[None, Unset, int] = UNSET
    infrastructure_fragility_score: Union[None, Unset, int] = UNSET
    geopolitical_risk_score: Union[None, Unset, int] = UNSET
    economic_cascade_score: Union[None, Unset, int] = UNSET
    source_confidence_score: Union[None, Unset, int] = UNSET
    proposed_priority_class: Union[None, Unset, str] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        flow_volume_score: Union[None, Unset, int]
        if isinstance(self.flow_volume_score, Unset):
            flow_volume_score = UNSET
        else:
            flow_volume_score = self.flow_volume_score

        substitution_difficulty_score: Union[None, Unset, int]
        if isinstance(self.substitution_difficulty_score, Unset):
            substitution_difficulty_score = UNSET
        else:
            substitution_difficulty_score = self.substitution_difficulty_score

        infrastructure_fragility_score: Union[None, Unset, int]
        if isinstance(self.infrastructure_fragility_score, Unset):
            infrastructure_fragility_score = UNSET
        else:
            infrastructure_fragility_score = self.infrastructure_fragility_score

        geopolitical_risk_score: Union[None, Unset, int]
        if isinstance(self.geopolitical_risk_score, Unset):
            geopolitical_risk_score = UNSET
        else:
            geopolitical_risk_score = self.geopolitical_risk_score

        economic_cascade_score: Union[None, Unset, int]
        if isinstance(self.economic_cascade_score, Unset):
            economic_cascade_score = UNSET
        else:
            economic_cascade_score = self.economic_cascade_score

        source_confidence_score: Union[None, Unset, int]
        if isinstance(self.source_confidence_score, Unset):
            source_confidence_score = UNSET
        else:
            source_confidence_score = self.source_confidence_score

        proposed_priority_class: Union[None, Unset, str]
        if isinstance(self.proposed_priority_class, Unset):
            proposed_priority_class = UNSET
        else:
            proposed_priority_class = self.proposed_priority_class


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if flow_volume_score is not UNSET:
            field_dict["flow_volume_score"] = flow_volume_score
        if substitution_difficulty_score is not UNSET:
            field_dict["substitution_difficulty_score"] = substitution_difficulty_score
        if infrastructure_fragility_score is not UNSET:
            field_dict["infrastructure_fragility_score"] = infrastructure_fragility_score
        if geopolitical_risk_score is not UNSET:
            field_dict["geopolitical_risk_score"] = geopolitical_risk_score
        if economic_cascade_score is not UNSET:
            field_dict["economic_cascade_score"] = economic_cascade_score
        if source_confidence_score is not UNSET:
            field_dict["source_confidence_score"] = source_confidence_score
        if proposed_priority_class is not UNSET:
            field_dict["proposed_priority_class"] = proposed_priority_class

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        def _parse_flow_volume_score(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        flow_volume_score = _parse_flow_volume_score(d.pop("flow_volume_score", UNSET))


        def _parse_substitution_difficulty_score(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        substitution_difficulty_score = _parse_substitution_difficulty_score(d.pop("substitution_difficulty_score", UNSET))


        def _parse_infrastructure_fragility_score(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        infrastructure_fragility_score = _parse_infrastructure_fragility_score(d.pop("infrastructure_fragility_score", UNSET))


        def _parse_geopolitical_risk_score(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        geopolitical_risk_score = _parse_geopolitical_risk_score(d.pop("geopolitical_risk_score", UNSET))


        def _parse_economic_cascade_score(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        economic_cascade_score = _parse_economic_cascade_score(d.pop("economic_cascade_score", UNSET))


        def _parse_source_confidence_score(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        source_confidence_score = _parse_source_confidence_score(d.pop("source_confidence_score", UNSET))


        def _parse_proposed_priority_class(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        proposed_priority_class = _parse_proposed_priority_class(d.pop("proposed_priority_class", UNSET))


        analysis_criticality_score_row = cls(
            flow_volume_score=flow_volume_score,
            substitution_difficulty_score=substitution_difficulty_score,
            infrastructure_fragility_score=infrastructure_fragility_score,
            geopolitical_risk_score=geopolitical_risk_score,
            economic_cascade_score=economic_cascade_score,
            source_confidence_score=source_confidence_score,
            proposed_priority_class=proposed_priority_class,
        )


        analysis_criticality_score_row.additional_properties = d
        return analysis_criticality_score_row

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
