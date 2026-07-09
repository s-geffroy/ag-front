from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="SfuVerdictOut")



@_attrs_define
class SfuVerdictOut:
    """ 
        Attributes:
            decision (str):
            status (str):
            confidence (Union[None, Unset, str]):
            rationale (Union[None, Unset, str]):
            required_actions (Union[Unset, list[str]]):
            supporting_sources (Union[Unset, list[str]]):
            rejected_verdicts (Union[Unset, list[Any]]):
     """

    decision: str
    status: str
    confidence: Union[None, Unset, str] = UNSET
    rationale: Union[None, Unset, str] = UNSET
    required_actions: Union[Unset, list[str]] = UNSET
    supporting_sources: Union[Unset, list[str]] = UNSET
    rejected_verdicts: Union[Unset, list[Any]] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        decision = self.decision

        status = self.status

        confidence: Union[None, Unset, str]
        if isinstance(self.confidence, Unset):
            confidence = UNSET
        else:
            confidence = self.confidence

        rationale: Union[None, Unset, str]
        if isinstance(self.rationale, Unset):
            rationale = UNSET
        else:
            rationale = self.rationale

        required_actions: Union[Unset, list[str]] = UNSET
        if not isinstance(self.required_actions, Unset):
            required_actions = self.required_actions



        supporting_sources: Union[Unset, list[str]] = UNSET
        if not isinstance(self.supporting_sources, Unset):
            supporting_sources = self.supporting_sources



        rejected_verdicts: Union[Unset, list[Any]] = UNSET
        if not isinstance(self.rejected_verdicts, Unset):
            rejected_verdicts = self.rejected_verdicts




        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "decision": decision,
            "status": status,
        })
        if confidence is not UNSET:
            field_dict["confidence"] = confidence
        if rationale is not UNSET:
            field_dict["rationale"] = rationale
        if required_actions is not UNSET:
            field_dict["required_actions"] = required_actions
        if supporting_sources is not UNSET:
            field_dict["supporting_sources"] = supporting_sources
        if rejected_verdicts is not UNSET:
            field_dict["rejected_verdicts"] = rejected_verdicts

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        decision = d.pop("decision")

        status = d.pop("status")

        def _parse_confidence(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        confidence = _parse_confidence(d.pop("confidence", UNSET))


        def _parse_rationale(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        rationale = _parse_rationale(d.pop("rationale", UNSET))


        required_actions = cast(list[str], d.pop("required_actions", UNSET))


        supporting_sources = cast(list[str], d.pop("supporting_sources", UNSET))


        rejected_verdicts = cast(list[Any], d.pop("rejected_verdicts", UNSET))


        sfu_verdict_out = cls(
            decision=decision,
            status=status,
            confidence=confidence,
            rationale=rationale,
            required_actions=required_actions,
            supporting_sources=supporting_sources,
            rejected_verdicts=rejected_verdicts,
        )


        sfu_verdict_out.additional_properties = d
        return sfu_verdict_out

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
