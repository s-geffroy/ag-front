from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..models.dimension_score_confidence_type_0 import DimensionScoreConfidenceType0
from ..types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="DimensionScore")



@_attrs_define
class DimensionScore:
    """ One named CVI dimension (ADR 0055). `score` is an integer 0–5 (higher = more vulnerability);
    `rationale` is non-empty and cites the engine inputs; `confidence` is the ethics-required data-quality
    grade (bas|moyen|eleve).

        Attributes:
            score (int):
            rationale (str):
            confidence (Union[DimensionScoreConfidenceType0, None, Unset]):
            source_refs (Union[Unset, list[str]]):
            uncertainties (Union[Unset, list[str]]):
     """

    score: int
    rationale: str
    confidence: Union[DimensionScoreConfidenceType0, None, Unset] = UNSET
    source_refs: Union[Unset, list[str]] = UNSET
    uncertainties: Union[Unset, list[str]] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        score = self.score

        rationale = self.rationale

        confidence: Union[None, Unset, str]
        if isinstance(self.confidence, Unset):
            confidence = UNSET
        elif isinstance(self.confidence, DimensionScoreConfidenceType0):
            confidence = self.confidence.value
        else:
            confidence = self.confidence

        source_refs: Union[Unset, list[str]] = UNSET
        if not isinstance(self.source_refs, Unset):
            source_refs = self.source_refs



        uncertainties: Union[Unset, list[str]] = UNSET
        if not isinstance(self.uncertainties, Unset):
            uncertainties = self.uncertainties




        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "score": score,
            "rationale": rationale,
        })
        if confidence is not UNSET:
            field_dict["confidence"] = confidence
        if source_refs is not UNSET:
            field_dict["source_refs"] = source_refs
        if uncertainties is not UNSET:
            field_dict["uncertainties"] = uncertainties

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        score = d.pop("score")

        rationale = d.pop("rationale")

        def _parse_confidence(data: object) -> Union[DimensionScoreConfidenceType0, None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                confidence_type_0 = DimensionScoreConfidenceType0(data)



                return confidence_type_0
            except: # noqa: E722
                pass
            return cast(Union[DimensionScoreConfidenceType0, None, Unset], data)

        confidence = _parse_confidence(d.pop("confidence", UNSET))


        source_refs = cast(list[str], d.pop("source_refs", UNSET))


        uncertainties = cast(list[str], d.pop("uncertainties", UNSET))


        dimension_score = cls(
            score=score,
            rationale=rationale,
            confidence=confidence,
            source_refs=source_refs,
            uncertainties=uncertainties,
        )


        dimension_score.additional_properties = d
        return dimension_score

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
