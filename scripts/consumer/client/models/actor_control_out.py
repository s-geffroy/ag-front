from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from dateutil.parser import isoparse
from typing import cast
from typing import cast, Union
from typing import Union
import datetime






T = TypeVar("T", bound="ActorControlOut")



@_attrs_define
class ActorControlOut:
    """ 
        Attributes:
            actor_id (str):
            chokepoint_id (str):
            control_type (str):
            actor_name (Union[None, Unset, str]):
            actor_type (Union[None, Unset, str]):
            control_strength (Union[None, Unset, int]):
            basis (Union[None, Unset, str]):
            source_confidence (Union[None, Unset, str]):
            valid_from (Union[None, Unset, datetime.date]):
            valid_to (Union[None, Unset, datetime.date]):
     """

    actor_id: str
    chokepoint_id: str
    control_type: str
    actor_name: Union[None, Unset, str] = UNSET
    actor_type: Union[None, Unset, str] = UNSET
    control_strength: Union[None, Unset, int] = UNSET
    basis: Union[None, Unset, str] = UNSET
    source_confidence: Union[None, Unset, str] = UNSET
    valid_from: Union[None, Unset, datetime.date] = UNSET
    valid_to: Union[None, Unset, datetime.date] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        actor_id = self.actor_id

        chokepoint_id = self.chokepoint_id

        control_type = self.control_type

        actor_name: Union[None, Unset, str]
        if isinstance(self.actor_name, Unset):
            actor_name = UNSET
        else:
            actor_name = self.actor_name

        actor_type: Union[None, Unset, str]
        if isinstance(self.actor_type, Unset):
            actor_type = UNSET
        else:
            actor_type = self.actor_type

        control_strength: Union[None, Unset, int]
        if isinstance(self.control_strength, Unset):
            control_strength = UNSET
        else:
            control_strength = self.control_strength

        basis: Union[None, Unset, str]
        if isinstance(self.basis, Unset):
            basis = UNSET
        else:
            basis = self.basis

        source_confidence: Union[None, Unset, str]
        if isinstance(self.source_confidence, Unset):
            source_confidence = UNSET
        else:
            source_confidence = self.source_confidence

        valid_from: Union[None, Unset, str]
        if isinstance(self.valid_from, Unset):
            valid_from = UNSET
        elif isinstance(self.valid_from, datetime.date):
            valid_from = self.valid_from.isoformat()
        else:
            valid_from = self.valid_from

        valid_to: Union[None, Unset, str]
        if isinstance(self.valid_to, Unset):
            valid_to = UNSET
        elif isinstance(self.valid_to, datetime.date):
            valid_to = self.valid_to.isoformat()
        else:
            valid_to = self.valid_to


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "actor_id": actor_id,
            "chokepoint_id": chokepoint_id,
            "control_type": control_type,
        })
        if actor_name is not UNSET:
            field_dict["actor_name"] = actor_name
        if actor_type is not UNSET:
            field_dict["actor_type"] = actor_type
        if control_strength is not UNSET:
            field_dict["control_strength"] = control_strength
        if basis is not UNSET:
            field_dict["basis"] = basis
        if source_confidence is not UNSET:
            field_dict["source_confidence"] = source_confidence
        if valid_from is not UNSET:
            field_dict["valid_from"] = valid_from
        if valid_to is not UNSET:
            field_dict["valid_to"] = valid_to

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        actor_id = d.pop("actor_id")

        chokepoint_id = d.pop("chokepoint_id")

        control_type = d.pop("control_type")

        def _parse_actor_name(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        actor_name = _parse_actor_name(d.pop("actor_name", UNSET))


        def _parse_actor_type(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        actor_type = _parse_actor_type(d.pop("actor_type", UNSET))


        def _parse_control_strength(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        control_strength = _parse_control_strength(d.pop("control_strength", UNSET))


        def _parse_basis(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        basis = _parse_basis(d.pop("basis", UNSET))


        def _parse_source_confidence(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        source_confidence = _parse_source_confidence(d.pop("source_confidence", UNSET))


        def _parse_valid_from(data: object) -> Union[None, Unset, datetime.date]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                valid_from_type_0 = isoparse(data).date()



                return valid_from_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, Unset, datetime.date], data)

        valid_from = _parse_valid_from(d.pop("valid_from", UNSET))


        def _parse_valid_to(data: object) -> Union[None, Unset, datetime.date]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                valid_to_type_0 = isoparse(data).date()



                return valid_to_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, Unset, datetime.date], data)

        valid_to = _parse_valid_to(d.pop("valid_to", UNSET))


        actor_control_out = cls(
            actor_id=actor_id,
            chokepoint_id=chokepoint_id,
            control_type=control_type,
            actor_name=actor_name,
            actor_type=actor_type,
            control_strength=control_strength,
            basis=basis,
            source_confidence=source_confidence,
            valid_from=valid_from,
            valid_to=valid_to,
        )


        actor_control_out.additional_properties = d
        return actor_control_out

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
