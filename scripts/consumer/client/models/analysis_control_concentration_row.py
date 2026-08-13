from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="AnalysisControlConcentrationRow")



@_attrs_define
class AnalysisControlConcentrationRow:
    """ One `control_concentration` row (`analytics.control_concentration_result`).

        Attributes:
            hhi (Union[None, Unset, float]):
            actor_count (Union[None, Unset, int]):
            top_actor_id (Union[None, Unset, str]):
            top_actor_share (Union[None, Unset, float]):
            state_count (Union[None, Unset, int]):
            by_actor (Union[Any, None, Unset]):
     """

    hhi: Union[None, Unset, float] = UNSET
    actor_count: Union[None, Unset, int] = UNSET
    top_actor_id: Union[None, Unset, str] = UNSET
    top_actor_share: Union[None, Unset, float] = UNSET
    state_count: Union[None, Unset, int] = UNSET
    by_actor: Union[Any, None, Unset] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        hhi: Union[None, Unset, float]
        if isinstance(self.hhi, Unset):
            hhi = UNSET
        else:
            hhi = self.hhi

        actor_count: Union[None, Unset, int]
        if isinstance(self.actor_count, Unset):
            actor_count = UNSET
        else:
            actor_count = self.actor_count

        top_actor_id: Union[None, Unset, str]
        if isinstance(self.top_actor_id, Unset):
            top_actor_id = UNSET
        else:
            top_actor_id = self.top_actor_id

        top_actor_share: Union[None, Unset, float]
        if isinstance(self.top_actor_share, Unset):
            top_actor_share = UNSET
        else:
            top_actor_share = self.top_actor_share

        state_count: Union[None, Unset, int]
        if isinstance(self.state_count, Unset):
            state_count = UNSET
        else:
            state_count = self.state_count

        by_actor: Union[Any, None, Unset]
        if isinstance(self.by_actor, Unset):
            by_actor = UNSET
        else:
            by_actor = self.by_actor


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if hhi is not UNSET:
            field_dict["hhi"] = hhi
        if actor_count is not UNSET:
            field_dict["actor_count"] = actor_count
        if top_actor_id is not UNSET:
            field_dict["top_actor_id"] = top_actor_id
        if top_actor_share is not UNSET:
            field_dict["top_actor_share"] = top_actor_share
        if state_count is not UNSET:
            field_dict["state_count"] = state_count
        if by_actor is not UNSET:
            field_dict["by_actor"] = by_actor

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        def _parse_hhi(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        hhi = _parse_hhi(d.pop("hhi", UNSET))


        def _parse_actor_count(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        actor_count = _parse_actor_count(d.pop("actor_count", UNSET))


        def _parse_top_actor_id(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        top_actor_id = _parse_top_actor_id(d.pop("top_actor_id", UNSET))


        def _parse_top_actor_share(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        top_actor_share = _parse_top_actor_share(d.pop("top_actor_share", UNSET))


        def _parse_state_count(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        state_count = _parse_state_count(d.pop("state_count", UNSET))


        def _parse_by_actor(data: object) -> Union[Any, None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[Any, None, Unset], data)

        by_actor = _parse_by_actor(d.pop("by_actor", UNSET))


        analysis_control_concentration_row = cls(
            hhi=hhi,
            actor_count=actor_count,
            top_actor_id=top_actor_id,
            top_actor_share=top_actor_share,
            state_count=state_count,
            by_actor=by_actor,
        )


        analysis_control_concentration_row.additional_properties = d
        return analysis_control_concentration_row

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
