from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="AnalysisClaimOut")



@_attrs_define
class AnalysisClaimOut:
    """ An evidence claim and the sources backing it — the text, not just the source ids.

        Attributes:
            claim_type (Union[None, Unset, str]):
            claim_text (Union[None, Unset, str]):
            verification_status (Union[None, Unset, str]):
            confidence_score (Union[None, Unset, int]):
            sources (Union[Unset, list[str]]):
     """

    claim_type: Union[None, Unset, str] = UNSET
    claim_text: Union[None, Unset, str] = UNSET
    verification_status: Union[None, Unset, str] = UNSET
    confidence_score: Union[None, Unset, int] = UNSET
    sources: Union[Unset, list[str]] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        claim_type: Union[None, Unset, str]
        if isinstance(self.claim_type, Unset):
            claim_type = UNSET
        else:
            claim_type = self.claim_type

        claim_text: Union[None, Unset, str]
        if isinstance(self.claim_text, Unset):
            claim_text = UNSET
        else:
            claim_text = self.claim_text

        verification_status: Union[None, Unset, str]
        if isinstance(self.verification_status, Unset):
            verification_status = UNSET
        else:
            verification_status = self.verification_status

        confidence_score: Union[None, Unset, int]
        if isinstance(self.confidence_score, Unset):
            confidence_score = UNSET
        else:
            confidence_score = self.confidence_score

        sources: Union[Unset, list[str]] = UNSET
        if not isinstance(self.sources, Unset):
            sources = self.sources




        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if claim_type is not UNSET:
            field_dict["claim_type"] = claim_type
        if claim_text is not UNSET:
            field_dict["claim_text"] = claim_text
        if verification_status is not UNSET:
            field_dict["verification_status"] = verification_status
        if confidence_score is not UNSET:
            field_dict["confidence_score"] = confidence_score
        if sources is not UNSET:
            field_dict["sources"] = sources

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        def _parse_claim_type(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        claim_type = _parse_claim_type(d.pop("claim_type", UNSET))


        def _parse_claim_text(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        claim_text = _parse_claim_text(d.pop("claim_text", UNSET))


        def _parse_verification_status(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        verification_status = _parse_verification_status(d.pop("verification_status", UNSET))


        def _parse_confidence_score(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        confidence_score = _parse_confidence_score(d.pop("confidence_score", UNSET))


        sources = cast(list[str], d.pop("sources", UNSET))


        analysis_claim_out = cls(
            claim_type=claim_type,
            claim_text=claim_text,
            verification_status=verification_status,
            confidence_score=confidence_score,
            sources=sources,
        )


        analysis_claim_out.additional_properties = d
        return analysis_claim_out

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
