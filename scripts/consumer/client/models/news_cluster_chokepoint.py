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
    """ 
        Attributes:
            chokepoint_id (str):
            canonical_name (Union[None, Unset, str]):
            relevance (Union[None, Unset, float]):
     """

    chokepoint_id: str
    canonical_name: Union[None, Unset, str] = UNSET
    relevance: Union[None, Unset, float] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        chokepoint_id = self.chokepoint_id

        canonical_name: Union[None, Unset, str]
        if isinstance(self.canonical_name, Unset):
            canonical_name = UNSET
        else:
            canonical_name = self.canonical_name

        relevance: Union[None, Unset, float]
        if isinstance(self.relevance, Unset):
            relevance = UNSET
        else:
            relevance = self.relevance


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "chokepoint_id": chokepoint_id,
        })
        if canonical_name is not UNSET:
            field_dict["canonical_name"] = canonical_name
        if relevance is not UNSET:
            field_dict["relevance"] = relevance

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


        def _parse_relevance(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        relevance = _parse_relevance(d.pop("relevance", UNSET))


        news_cluster_chokepoint = cls(
            chokepoint_id=chokepoint_id,
            canonical_name=canonical_name,
            relevance=relevance,
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
