from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="SfuCompletenessOut")



@_attrs_define
class SfuCompletenessOut:
    """ Why a fiche block is empty. Per ADR 0054 only 4 of the 10 dimensions have a deterministic engine
    source; the 6 judgment dimensions and the verdict are authored by a human, never invented.

        Attributes:
            dimensions_total (Union[Unset, int]):  Default: 10.
            dimensions_scored (Union[Unset, int]):  Default: 0.
            analyst_dimensions (Union[Unset, int]):  Default: 0.
            auto_dimensions (Union[Unset, int]):  Default: 0.
            has_draft (Union[Unset, bool]):  Default: False.
            draft_status (Union[None, Unset, str]):
            has_verdict (Union[Unset, bool]):  Default: False.
            verdict_status (Union[None, Unset, str]):
            awaiting_analyst_verdict (Union[Unset, bool]):  Default: True.
     """

    dimensions_total: Union[Unset, int] = 10
    dimensions_scored: Union[Unset, int] = 0
    analyst_dimensions: Union[Unset, int] = 0
    auto_dimensions: Union[Unset, int] = 0
    has_draft: Union[Unset, bool] = False
    draft_status: Union[None, Unset, str] = UNSET
    has_verdict: Union[Unset, bool] = False
    verdict_status: Union[None, Unset, str] = UNSET
    awaiting_analyst_verdict: Union[Unset, bool] = True
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        dimensions_total = self.dimensions_total

        dimensions_scored = self.dimensions_scored

        analyst_dimensions = self.analyst_dimensions

        auto_dimensions = self.auto_dimensions

        has_draft = self.has_draft

        draft_status: Union[None, Unset, str]
        if isinstance(self.draft_status, Unset):
            draft_status = UNSET
        else:
            draft_status = self.draft_status

        has_verdict = self.has_verdict

        verdict_status: Union[None, Unset, str]
        if isinstance(self.verdict_status, Unset):
            verdict_status = UNSET
        else:
            verdict_status = self.verdict_status

        awaiting_analyst_verdict = self.awaiting_analyst_verdict


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if dimensions_total is not UNSET:
            field_dict["dimensions_total"] = dimensions_total
        if dimensions_scored is not UNSET:
            field_dict["dimensions_scored"] = dimensions_scored
        if analyst_dimensions is not UNSET:
            field_dict["analyst_dimensions"] = analyst_dimensions
        if auto_dimensions is not UNSET:
            field_dict["auto_dimensions"] = auto_dimensions
        if has_draft is not UNSET:
            field_dict["has_draft"] = has_draft
        if draft_status is not UNSET:
            field_dict["draft_status"] = draft_status
        if has_verdict is not UNSET:
            field_dict["has_verdict"] = has_verdict
        if verdict_status is not UNSET:
            field_dict["verdict_status"] = verdict_status
        if awaiting_analyst_verdict is not UNSET:
            field_dict["awaiting_analyst_verdict"] = awaiting_analyst_verdict

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        dimensions_total = d.pop("dimensions_total", UNSET)

        dimensions_scored = d.pop("dimensions_scored", UNSET)

        analyst_dimensions = d.pop("analyst_dimensions", UNSET)

        auto_dimensions = d.pop("auto_dimensions", UNSET)

        has_draft = d.pop("has_draft", UNSET)

        def _parse_draft_status(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        draft_status = _parse_draft_status(d.pop("draft_status", UNSET))


        has_verdict = d.pop("has_verdict", UNSET)

        def _parse_verdict_status(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        verdict_status = _parse_verdict_status(d.pop("verdict_status", UNSET))


        awaiting_analyst_verdict = d.pop("awaiting_analyst_verdict", UNSET)

        sfu_completeness_out = cls(
            dimensions_total=dimensions_total,
            dimensions_scored=dimensions_scored,
            analyst_dimensions=analyst_dimensions,
            auto_dimensions=auto_dimensions,
            has_draft=has_draft,
            draft_status=draft_status,
            has_verdict=has_verdict,
            verdict_status=verdict_status,
            awaiting_analyst_verdict=awaiting_analyst_verdict,
        )


        sfu_completeness_out.additional_properties = d
        return sfu_completeness_out

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
