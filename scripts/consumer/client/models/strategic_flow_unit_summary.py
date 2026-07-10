from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="StrategicFlowUnitSummary")



@_attrs_define
class StrategicFlowUnitSummary:
    """ 
        Attributes:
            id (str):
            name (str):
            flow_type (str):
            validation_status (str):
            priority_class (Union[None, Unset, str]):
            status (Union[None, Unset, str]):
            verdict (Union[None, Unset, str]):
            verdict_status (Union[None, Unset, str]):
            dimensions_scored (Union[Unset, int]):  Default: 0.
     """

    id: str
    name: str
    flow_type: str
    validation_status: str
    priority_class: Union[None, Unset, str] = UNSET
    status: Union[None, Unset, str] = UNSET
    verdict: Union[None, Unset, str] = UNSET
    verdict_status: Union[None, Unset, str] = UNSET
    dimensions_scored: Union[Unset, int] = 0
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        id = self.id

        name = self.name

        flow_type = self.flow_type

        validation_status = self.validation_status

        priority_class: Union[None, Unset, str]
        if isinstance(self.priority_class, Unset):
            priority_class = UNSET
        else:
            priority_class = self.priority_class

        status: Union[None, Unset, str]
        if isinstance(self.status, Unset):
            status = UNSET
        else:
            status = self.status

        verdict: Union[None, Unset, str]
        if isinstance(self.verdict, Unset):
            verdict = UNSET
        else:
            verdict = self.verdict

        verdict_status: Union[None, Unset, str]
        if isinstance(self.verdict_status, Unset):
            verdict_status = UNSET
        else:
            verdict_status = self.verdict_status

        dimensions_scored = self.dimensions_scored


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "id": id,
            "name": name,
            "flow_type": flow_type,
            "validation_status": validation_status,
        })
        if priority_class is not UNSET:
            field_dict["priority_class"] = priority_class
        if status is not UNSET:
            field_dict["status"] = status
        if verdict is not UNSET:
            field_dict["verdict"] = verdict
        if verdict_status is not UNSET:
            field_dict["verdict_status"] = verdict_status
        if dimensions_scored is not UNSET:
            field_dict["dimensions_scored"] = dimensions_scored

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        name = d.pop("name")

        flow_type = d.pop("flow_type")

        validation_status = d.pop("validation_status")

        def _parse_priority_class(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        priority_class = _parse_priority_class(d.pop("priority_class", UNSET))


        def _parse_status(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        status = _parse_status(d.pop("status", UNSET))


        def _parse_verdict(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        verdict = _parse_verdict(d.pop("verdict", UNSET))


        def _parse_verdict_status(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        verdict_status = _parse_verdict_status(d.pop("verdict_status", UNSET))


        dimensions_scored = d.pop("dimensions_scored", UNSET)

        strategic_flow_unit_summary = cls(
            id=id,
            name=name,
            flow_type=flow_type,
            validation_status=validation_status,
            priority_class=priority_class,
            status=status,
            verdict=verdict,
            verdict_status=verdict_status,
            dimensions_scored=dimensions_scored,
        )


        strategic_flow_unit_summary.additional_properties = d
        return strategic_flow_unit_summary

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
