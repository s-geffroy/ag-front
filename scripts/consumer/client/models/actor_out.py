from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="ActorOut")



@_attrs_define
class ActorOut:
    """ 
        Attributes:
            id (str):
            name (str):
            actor_type (str):
            validation_status (str):
            jurisdiction (Union[None, Unset, str]):
            control_edge_count (Union[Unset, int]):  Default: 0.
     """

    id: str
    name: str
    actor_type: str
    validation_status: str
    jurisdiction: Union[None, Unset, str] = UNSET
    control_edge_count: Union[Unset, int] = 0
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        id = self.id

        name = self.name

        actor_type = self.actor_type

        validation_status = self.validation_status

        jurisdiction: Union[None, Unset, str]
        if isinstance(self.jurisdiction, Unset):
            jurisdiction = UNSET
        else:
            jurisdiction = self.jurisdiction

        control_edge_count = self.control_edge_count


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "id": id,
            "name": name,
            "actor_type": actor_type,
            "validation_status": validation_status,
        })
        if jurisdiction is not UNSET:
            field_dict["jurisdiction"] = jurisdiction
        if control_edge_count is not UNSET:
            field_dict["control_edge_count"] = control_edge_count

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        name = d.pop("name")

        actor_type = d.pop("actor_type")

        validation_status = d.pop("validation_status")

        def _parse_jurisdiction(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        jurisdiction = _parse_jurisdiction(d.pop("jurisdiction", UNSET))


        control_edge_count = d.pop("control_edge_count", UNSET)

        actor_out = cls(
            id=id,
            name=name,
            actor_type=actor_type,
            validation_status=validation_status,
            jurisdiction=jurisdiction,
            control_edge_count=control_edge_count,
        )


        actor_out.additional_properties = d
        return actor_out

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
