from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="DerivedRelationOut")



@_attrs_define
class DerivedRelationOut:
    """ One candidate edge of the derived systemic graph (file-backed, pending validation).

        Attributes:
            from_object_id (str):
            to (str):
            to_status (str):
            relation_type (str):
            to_label (Union[None, Unset, str]):
            directionality (Union[None, Unset, str]):
            strength_score (Union[None, Unset, int]):
            analytical_effect (Union[Unset, list[str]]):
            affected_flows (Union[Unset, list[str]]):
            resolution_score (Union[None, Unset, float]):
            validation_status (Union[Unset, str]):  Default: 'not_validated'.
            evidence_file (Union[None, Unset, str]):
            evidence_quote (Union[None, Unset, str]):
     """

    from_object_id: str
    to: str
    to_status: str
    relation_type: str
    to_label: Union[None, Unset, str] = UNSET
    directionality: Union[None, Unset, str] = UNSET
    strength_score: Union[None, Unset, int] = UNSET
    analytical_effect: Union[Unset, list[str]] = UNSET
    affected_flows: Union[Unset, list[str]] = UNSET
    resolution_score: Union[None, Unset, float] = UNSET
    validation_status: Union[Unset, str] = 'not_validated'
    evidence_file: Union[None, Unset, str] = UNSET
    evidence_quote: Union[None, Unset, str] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        from_object_id = self.from_object_id

        to = self.to

        to_status = self.to_status

        relation_type = self.relation_type

        to_label: Union[None, Unset, str]
        if isinstance(self.to_label, Unset):
            to_label = UNSET
        else:
            to_label = self.to_label

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



        resolution_score: Union[None, Unset, float]
        if isinstance(self.resolution_score, Unset):
            resolution_score = UNSET
        else:
            resolution_score = self.resolution_score

        validation_status = self.validation_status

        evidence_file: Union[None, Unset, str]
        if isinstance(self.evidence_file, Unset):
            evidence_file = UNSET
        else:
            evidence_file = self.evidence_file

        evidence_quote: Union[None, Unset, str]
        if isinstance(self.evidence_quote, Unset):
            evidence_quote = UNSET
        else:
            evidence_quote = self.evidence_quote


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "from_object_id": from_object_id,
            "to": to,
            "to_status": to_status,
            "relation_type": relation_type,
        })
        if to_label is not UNSET:
            field_dict["to_label"] = to_label
        if directionality is not UNSET:
            field_dict["directionality"] = directionality
        if strength_score is not UNSET:
            field_dict["strength_score"] = strength_score
        if analytical_effect is not UNSET:
            field_dict["analytical_effect"] = analytical_effect
        if affected_flows is not UNSET:
            field_dict["affected_flows"] = affected_flows
        if resolution_score is not UNSET:
            field_dict["resolution_score"] = resolution_score
        if validation_status is not UNSET:
            field_dict["validation_status"] = validation_status
        if evidence_file is not UNSET:
            field_dict["evidence_file"] = evidence_file
        if evidence_quote is not UNSET:
            field_dict["evidence_quote"] = evidence_quote

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        from_object_id = d.pop("from_object_id")

        to = d.pop("to")

        to_status = d.pop("to_status")

        relation_type = d.pop("relation_type")

        def _parse_to_label(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        to_label = _parse_to_label(d.pop("to_label", UNSET))


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


        def _parse_resolution_score(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        resolution_score = _parse_resolution_score(d.pop("resolution_score", UNSET))


        validation_status = d.pop("validation_status", UNSET)

        def _parse_evidence_file(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        evidence_file = _parse_evidence_file(d.pop("evidence_file", UNSET))


        def _parse_evidence_quote(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        evidence_quote = _parse_evidence_quote(d.pop("evidence_quote", UNSET))


        derived_relation_out = cls(
            from_object_id=from_object_id,
            to=to,
            to_status=to_status,
            relation_type=relation_type,
            to_label=to_label,
            directionality=directionality,
            strength_score=strength_score,
            analytical_effect=analytical_effect,
            affected_flows=affected_flows,
            resolution_score=resolution_score,
            validation_status=validation_status,
            evidence_file=evidence_file,
            evidence_quote=evidence_quote,
        )


        derived_relation_out.additional_properties = d
        return derived_relation_out

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
