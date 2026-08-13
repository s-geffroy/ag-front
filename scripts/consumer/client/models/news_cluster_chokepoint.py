from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="NewsClusterChokepoint")



@_attrs_define
class NewsClusterChokepoint:
    """ A corridor this cluster was attached to.

    `cluster_salience` is NOT a per-corridor relevance — it is the cluster's single global
    `salience_score` (a model judgement, ADR 0076) copied onto every corridor link. It was called
    `relevance` until 1.0.0, which asserted something the data does not carry: on a multi-corridor
    cluster every link ties, so ordering by it degenerates. Renamed rather than filled, because we have
    no per-corridor measure and inventing one would be the second mistake.

        Attributes:
            chokepoint_id (str):
            canonical_name (Union[None, Unset, str]):
            cluster_salience (Union[None, Unset, float]):
     """

    chokepoint_id: str
    canonical_name: Union[None, Unset, str] = UNSET
    cluster_salience: Union[None, Unset, float] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        chokepoint_id = self.chokepoint_id

        canonical_name: Union[None, Unset, str]
        if isinstance(self.canonical_name, Unset):
            canonical_name = UNSET
        else:
            canonical_name = self.canonical_name

        cluster_salience: Union[None, Unset, float]
        if isinstance(self.cluster_salience, Unset):
            cluster_salience = UNSET
        else:
            cluster_salience = self.cluster_salience


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "chokepoint_id": chokepoint_id,
        })
        if canonical_name is not UNSET:
            field_dict["canonical_name"] = canonical_name
        if cluster_salience is not UNSET:
            field_dict["cluster_salience"] = cluster_salience

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        chokepoint_id = d.pop("chokepoint_id")

        def _parse_canonical_name(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        canonical_name = _parse_canonical_name(d.pop("canonical_name", UNSET))


        def _parse_cluster_salience(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        cluster_salience = _parse_cluster_salience(d.pop("cluster_salience", UNSET))


        news_cluster_chokepoint = cls(
            chokepoint_id=chokepoint_id,
            canonical_name=canonical_name,
            cluster_salience=cluster_salience,
        )


        news_cluster_chokepoint.additional_properties = d
        return news_cluster_chokepoint

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
