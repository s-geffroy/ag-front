from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast, Union
from typing import Union
from uuid import UUID






T = TypeVar("T", bound="AnalysisCorroborationRow")



@_attrs_define
class AnalysisCorroborationRow:
    """ One `corroboration` row (`analytics.corroboration_result`).

        Attributes:
            signal_claim_id (Union[None, UUID, Unset]):
            result_status (Union[None, Unset, str]):
            corroboration_score (Union[None, Unset, int]):
            best_tier (Union[None, Unset, str]):
            credibility_grade (Union[None, Unset, int]):
            reliability_grade (Union[None, Unset, str]):
            matched_count (Union[None, Unset, int]):
            independent_origin_count (Union[None, Unset, int]):
     """

    signal_claim_id: Union[None, UUID, Unset] = UNSET
    result_status: Union[None, Unset, str] = UNSET
    corroboration_score: Union[None, Unset, int] = UNSET
    best_tier: Union[None, Unset, str] = UNSET
    credibility_grade: Union[None, Unset, int] = UNSET
    reliability_grade: Union[None, Unset, str] = UNSET
    matched_count: Union[None, Unset, int] = UNSET
    independent_origin_count: Union[None, Unset, int] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        signal_claim_id: Union[None, Unset, str]
        if isinstance(self.signal_claim_id, Unset):
            signal_claim_id = UNSET
        elif isinstance(self.signal_claim_id, UUID):
            signal_claim_id = str(self.signal_claim_id)
        else:
            signal_claim_id = self.signal_claim_id

        result_status: Union[None, Unset, str]
        if isinstance(self.result_status, Unset):
            result_status = UNSET
        else:
            result_status = self.result_status

        corroboration_score: Union[None, Unset, int]
        if isinstance(self.corroboration_score, Unset):
            corroboration_score = UNSET
        else:
            corroboration_score = self.corroboration_score

        best_tier: Union[None, Unset, str]
        if isinstance(self.best_tier, Unset):
            best_tier = UNSET
        else:
            best_tier = self.best_tier

        credibility_grade: Union[None, Unset, int]
        if isinstance(self.credibility_grade, Unset):
            credibility_grade = UNSET
        else:
            credibility_grade = self.credibility_grade

        reliability_grade: Union[None, Unset, str]
        if isinstance(self.reliability_grade, Unset):
            reliability_grade = UNSET
        else:
            reliability_grade = self.reliability_grade

        matched_count: Union[None, Unset, int]
        if isinstance(self.matched_count, Unset):
            matched_count = UNSET
        else:
            matched_count = self.matched_count

        independent_origin_count: Union[None, Unset, int]
        if isinstance(self.independent_origin_count, Unset):
            independent_origin_count = UNSET
        else:
            independent_origin_count = self.independent_origin_count


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if signal_claim_id is not UNSET:
            field_dict["signal_claim_id"] = signal_claim_id
        if result_status is not UNSET:
            field_dict["result_status"] = result_status
        if corroboration_score is not UNSET:
            field_dict["corroboration_score"] = corroboration_score
        if best_tier is not UNSET:
            field_dict["best_tier"] = best_tier
        if credibility_grade is not UNSET:
            field_dict["credibility_grade"] = credibility_grade
        if reliability_grade is not UNSET:
            field_dict["reliability_grade"] = reliability_grade
        if matched_count is not UNSET:
            field_dict["matched_count"] = matched_count
        if independent_origin_count is not UNSET:
            field_dict["independent_origin_count"] = independent_origin_count

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        def _parse_signal_claim_id(data: object) -> Union[None, UUID, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                signal_claim_id_type_0 = UUID(data)



                return signal_claim_id_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, UUID, Unset], data)

        signal_claim_id = _parse_signal_claim_id(d.pop("signal_claim_id", UNSET))


        def _parse_result_status(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        result_status = _parse_result_status(d.pop("result_status", UNSET))


        def _parse_corroboration_score(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        corroboration_score = _parse_corroboration_score(d.pop("corroboration_score", UNSET))


        def _parse_best_tier(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        best_tier = _parse_best_tier(d.pop("best_tier", UNSET))


        def _parse_credibility_grade(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        credibility_grade = _parse_credibility_grade(d.pop("credibility_grade", UNSET))


        def _parse_reliability_grade(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        reliability_grade = _parse_reliability_grade(d.pop("reliability_grade", UNSET))


        def _parse_matched_count(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        matched_count = _parse_matched_count(d.pop("matched_count", UNSET))


        def _parse_independent_origin_count(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        independent_origin_count = _parse_independent_origin_count(d.pop("independent_origin_count", UNSET))


        analysis_corroboration_row = cls(
            signal_claim_id=signal_claim_id,
            result_status=result_status,
            corroboration_score=corroboration_score,
            best_tier=best_tier,
            credibility_grade=credibility_grade,
            reliability_grade=reliability_grade,
            matched_count=matched_count,
            independent_origin_count=independent_origin_count,
        )


        analysis_corroboration_row.additional_properties = d
        return analysis_corroboration_row

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
