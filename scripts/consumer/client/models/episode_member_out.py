from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="EpisodeMemberOut")



@_attrs_define
class EpisodeMemberOut:
    """ 
        Attributes:
            chokepoint_id (str):
            canonical_name (Union[None, Unset, str]):
            object_role (Union[None, Unset, str]):
            priority_class (Union[None, Unset, str]):
            license_taint (Union[Unset, bool]):  Default: False.
     """

    chokepoint_id: str
    canonical_name: Union[None, Unset, str] = UNSET
    object_role: Union[None, Unset, str] = UNSET
    priority_class: Union[None, Unset, str] = UNSET
    license_taint: Union[Unset, bool] = False
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        chokepoint_id = self.chokepoint_id

        canonical_name: Union[None, Unset, str]
        if isinstance(self.canonical_name, Unset):
            canonical_name = UNSET
        else:
            canonical_name = self.canonical_name

        object_role: Union[None, Unset, str]
        if isinstance(self.object_role, Unset):
            object_role = UNSET
        else:
            object_role = self.object_role

        priority_class: Union[None, Unset, str]
        if isinstance(self.priority_class, Unset):
            priority_class = UNSET
        else:
            priority_class = self.priority_class

        license_taint = self.license_taint


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "chokepoint_id": chokepoint_id,
        })
        if canonical_name is not UNSET:
            field_dict["canonical_name"] = canonical_name
        if object_role is not UNSET:
            field_dict["object_role"] = object_role
        if priority_class is not UNSET:
            field_dict["priority_class"] = priority_class
        if license_taint is not UNSET:
            field_dict["license_taint"] = license_taint

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


        def _parse_object_role(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        object_role = _parse_object_role(d.pop("object_role", UNSET))


        def _parse_priority_class(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        priority_class = _parse_priority_class(d.pop("priority_class", UNSET))


        license_taint = d.pop("license_taint", UNSET)

        episode_member_out = cls(
            chokepoint_id=chokepoint_id,
            canonical_name=canonical_name,
            object_role=object_role,
            priority_class=priority_class,
            license_taint=license_taint,
        )


        episode_member_out.additional_properties = d
        return episode_member_out

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
