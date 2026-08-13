from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="AnalysisSubstitutionScoreRow")



@_attrs_define
class AnalysisSubstitutionScoreRow:
    """ One `substitution_score` row (`analytics.substitution_score_result`).

        Attributes:
            global_substitution_difficulty_score (Union[None, Unset, int]):
            best_alternative (Union[None, Unset, str]):
            worst_constraint (Union[None, Unset, str]):
            affected_flows (Union[None, Unset, list[str]]):
     """

    global_substitution_difficulty_score: Union[None, Unset, int] = UNSET
    best_alternative: Union[None, Unset, str] = UNSET
    worst_constraint: Union[None, Unset, str] = UNSET
    affected_flows: Union[None, Unset, list[str]] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        global_substitution_difficulty_score: Union[None, Unset, int]
        if isinstance(self.global_substitution_difficulty_score, Unset):
            global_substitution_difficulty_score = UNSET
        else:
            global_substitution_difficulty_score = self.global_substitution_difficulty_score

        best_alternative: Union[None, Unset, str]
        if isinstance(self.best_alternative, Unset):
            best_alternative = UNSET
        else:
            best_alternative = self.best_alternative

        worst_constraint: Union[None, Unset, str]
        if isinstance(self.worst_constraint, Unset):
            worst_constraint = UNSET
        else:
            worst_constraint = self.worst_constraint

        affected_flows: Union[None, Unset, list[str]]
        if isinstance(self.affected_flows, Unset):
            affected_flows = UNSET
        elif isinstance(self.affected_flows, list):
            affected_flows = self.affected_flows


        else:
            affected_flows = self.affected_flows


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if global_substitution_difficulty_score is not UNSET:
            field_dict["global_substitution_difficulty_score"] = global_substitution_difficulty_score
        if best_alternative is not UNSET:
            field_dict["best_alternative"] = best_alternative
        if worst_constraint is not UNSET:
            field_dict["worst_constraint"] = worst_constraint
        if affected_flows is not UNSET:
            field_dict["affected_flows"] = affected_flows

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        def _parse_global_substitution_difficulty_score(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        global_substitution_difficulty_score = _parse_global_substitution_difficulty_score(d.pop("global_substitution_difficulty_score", UNSET))


        def _parse_best_alternative(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        best_alternative = _parse_best_alternative(d.pop("best_alternative", UNSET))


        def _parse_worst_constraint(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        worst_constraint = _parse_worst_constraint(d.pop("worst_constraint", UNSET))


        def _parse_affected_flows(data: object) -> Union[None, Unset, list[str]]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                affected_flows_type_0 = cast(list[str], data)

                return affected_flows_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, Unset, list[str]], data)

        affected_flows = _parse_affected_flows(d.pop("affected_flows", UNSET))


        analysis_substitution_score_row = cls(
            global_substitution_difficulty_score=global_substitution_difficulty_score,
            best_alternative=best_alternative,
            worst_constraint=worst_constraint,
            affected_flows=affected_flows,
        )


        analysis_substitution_score_row.additional_properties = d
        return analysis_substitution_score_row

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
