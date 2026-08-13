from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="AnalysisWeaponizabilityRow")



@_attrs_define
class AnalysisWeaponizabilityRow:
    """ One `weaponizability` row (`analytics.weaponizability_result`).

        Attributes:
            leverage_score (Union[None, Unset, float]):
            top_actor_id (Union[None, Unset, str]):
            top_actor_leverage (Union[None, Unset, float]):
            control_share (Union[None, Unset, float]):
            betweenness (Union[None, Unset, float]):
            dependency (Union[None, Unset, float]):
            substitution_factor (Union[None, Unset, float]):
     """

    leverage_score: Union[None, Unset, float] = UNSET
    top_actor_id: Union[None, Unset, str] = UNSET
    top_actor_leverage: Union[None, Unset, float] = UNSET
    control_share: Union[None, Unset, float] = UNSET
    betweenness: Union[None, Unset, float] = UNSET
    dependency: Union[None, Unset, float] = UNSET
    substitution_factor: Union[None, Unset, float] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        leverage_score: Union[None, Unset, float]
        if isinstance(self.leverage_score, Unset):
            leverage_score = UNSET
        else:
            leverage_score = self.leverage_score

        top_actor_id: Union[None, Unset, str]
        if isinstance(self.top_actor_id, Unset):
            top_actor_id = UNSET
        else:
            top_actor_id = self.top_actor_id

        top_actor_leverage: Union[None, Unset, float]
        if isinstance(self.top_actor_leverage, Unset):
            top_actor_leverage = UNSET
        else:
            top_actor_leverage = self.top_actor_leverage

        control_share: Union[None, Unset, float]
        if isinstance(self.control_share, Unset):
            control_share = UNSET
        else:
            control_share = self.control_share

        betweenness: Union[None, Unset, float]
        if isinstance(self.betweenness, Unset):
            betweenness = UNSET
        else:
            betweenness = self.betweenness

        dependency: Union[None, Unset, float]
        if isinstance(self.dependency, Unset):
            dependency = UNSET
        else:
            dependency = self.dependency

        substitution_factor: Union[None, Unset, float]
        if isinstance(self.substitution_factor, Unset):
            substitution_factor = UNSET
        else:
            substitution_factor = self.substitution_factor


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if leverage_score is not UNSET:
            field_dict["leverage_score"] = leverage_score
        if top_actor_id is not UNSET:
            field_dict["top_actor_id"] = top_actor_id
        if top_actor_leverage is not UNSET:
            field_dict["top_actor_leverage"] = top_actor_leverage
        if control_share is not UNSET:
            field_dict["control_share"] = control_share
        if betweenness is not UNSET:
            field_dict["betweenness"] = betweenness
        if dependency is not UNSET:
            field_dict["dependency"] = dependency
        if substitution_factor is not UNSET:
            field_dict["substitution_factor"] = substitution_factor

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        def _parse_leverage_score(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        leverage_score = _parse_leverage_score(d.pop("leverage_score", UNSET))


        def _parse_top_actor_id(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        top_actor_id = _parse_top_actor_id(d.pop("top_actor_id", UNSET))


        def _parse_top_actor_leverage(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        top_actor_leverage = _parse_top_actor_leverage(d.pop("top_actor_leverage", UNSET))


        def _parse_control_share(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        control_share = _parse_control_share(d.pop("control_share", UNSET))


        def _parse_betweenness(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        betweenness = _parse_betweenness(d.pop("betweenness", UNSET))


        def _parse_dependency(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        dependency = _parse_dependency(d.pop("dependency", UNSET))


        def _parse_substitution_factor(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        substitution_factor = _parse_substitution_factor(d.pop("substitution_factor", UNSET))


        analysis_weaponizability_row = cls(
            leverage_score=leverage_score,
            top_actor_id=top_actor_id,
            top_actor_leverage=top_actor_leverage,
            control_share=control_share,
            betweenness=betweenness,
            dependency=dependency,
            substitution_factor=substitution_factor,
        )


        analysis_weaponizability_row.additional_properties = d
        return analysis_weaponizability_row

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
