from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="AnalysisRelationOut")



@_attrs_define
class AnalysisRelationOut:
    """ A curated relation edge, rendered from THIS object's point of view: `other` is the far endpoint
    and `arrow` says which way it points.

        Attributes:
            other (str):
            arrow (str):
            relation_type (Union[None, Unset, str]):
            directionality (Union[None, Unset, str]):
            strength_score (Union[None, Unset, int]):
            analytical_effect (Union[Unset, list[str]]):
            affected_flows (Union[Unset, list[str]]):
     """

    other: str
    arrow: str
    relation_type: Union[None, Unset, str] = UNSET
    directionality: Union[None, Unset, str] = UNSET
    strength_score: Union[None, Unset, int] = UNSET
    analytical_effect: Union[Unset, list[str]] = UNSET
    affected_flows: Union[Unset, list[str]] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        other = self.other

        arrow = self.arrow

        relation_type: Union[None, Unset, str]
        if isinstance(self.relation_type, Unset):
            relation_type = UNSET
        else:
            relation_type = self.relation_type

        directionality: Union[None, Unset, str]
        if isinstance(self.directionality, Unset):
            directionality = UNSET
        else:
            directionality = self.directionality

        strength_score: Union[None, Unset, int]
        if isinstance(self.strength_score, Unset):
            strength_score = UNSET
        else:
            strength_score = self.strength_score

        analytical_effect: Union[Unset, list[str]] = UNSET
        if not isinstance(self.analytical_effect, Unset):
            analytical_effect = self.analytical_effect



        affected_flows: Union[Unset, list[str]] = UNSET
        if not isinstance(self.affected_flows, Unset):
            affected_flows = self.affected_flows




        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "other": other,
            "arrow": arrow,
        })
        if relation_type is not UNSET:
            field_dict["relation_type"] = relation_type
        if directionality is not UNSET:
            field_dict["directionality"] = directionality
        if strength_score is not UNSET:
            field_dict["strength_score"] = strength_score
        if analytical_effect is not UNSET:
            field_dict["analytical_effect"] = analytical_effect
        if affected_flows is not UNSET:
            field_dict["affected_flows"] = affected_flows

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        other = d.pop("other")

        arrow = d.pop("arrow")

        def _parse_relation_type(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        relation_type = _parse_relation_type(d.pop("relation_type", UNSET))


        def _parse_directionality(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        directionality = _parse_directionality(d.pop("directionality", UNSET))


        def _parse_strength_score(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        strength_score = _parse_strength_score(d.pop("strength_score", UNSET))


        analytical_effect = cast(list[str], d.pop("analytical_effect", UNSET))


        affected_flows = cast(list[str], d.pop("affected_flows", UNSET))


        analysis_relation_out = cls(
            other=other,
            arrow=arrow,
            relation_type=relation_type,
            directionality=directionality,
            strength_score=strength_score,
            analytical_effect=analytical_effect,
            affected_flows=affected_flows,
        )


        analysis_relation_out.additional_properties = d
        return analysis_relation_out

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
