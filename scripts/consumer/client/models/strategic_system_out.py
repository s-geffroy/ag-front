from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="StrategicSystemOut")



@_attrs_define
class StrategicSystemOut:
    """ 
        Attributes:
            id (str):
            name (str):
            system_type (str):
            priority_class (Union[None, Unset, str]):
            notes (Union[None, Unset, str]):
            member_count (Union[Unset, int]):  Default: 0.
     """

    id: str
    name: str
    system_type: str
    priority_class: Union[None, Unset, str] = UNSET
    notes: Union[None, Unset, str] = UNSET
    member_count: Union[Unset, int] = 0
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        id = self.id

        name = self.name

        system_type = self.system_type

        priority_class: Union[None, Unset, str]
        if isinstance(self.priority_class, Unset):
            priority_class = UNSET
        else:
            priority_class = self.priority_class

        notes: Union[None, Unset, str]
        if isinstance(self.notes, Unset):
            notes = UNSET
        else:
            notes = self.notes

        member_count = self.member_count


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "id": id,
            "name": name,
            "system_type": system_type,
        })
        if priority_class is not UNSET:
            field_dict["priority_class"] = priority_class
        if notes is not UNSET:
            field_dict["notes"] = notes
        if member_count is not UNSET:
            field_dict["member_count"] = member_count

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        name = d.pop("name")

        system_type = d.pop("system_type")

        def _parse_priority_class(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        priority_class = _parse_priority_class(d.pop("priority_class", UNSET))


        def _parse_notes(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        notes = _parse_notes(d.pop("notes", UNSET))


        member_count = d.pop("member_count", UNSET)

        strategic_system_out = cls(
            id=id,
            name=name,
            system_type=system_type,
            priority_class=priority_class,
            notes=notes,
            member_count=member_count,
        )


        strategic_system_out.additional_properties = d
        return strategic_system_out

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
