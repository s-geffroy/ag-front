from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="ChokepointSummary")



@_attrs_define
class ChokepointSummary:
    """ 
        Attributes:
            id (str):
            canonical_name (str):
            object_kind (str):
            family (str):
            type_ (str):
            priority_class (str):
            license_taint (bool):
            macro_region (Union[None, Unset, str]):
            required_attributions (Union[Unset, list[str]]):
            max_license_risk (Union[None, Unset, str]):
     """

    id: str
    canonical_name: str
    object_kind: str
    family: str
    type_: str
    priority_class: str
    license_taint: bool
    macro_region: Union[None, Unset, str] = UNSET
    required_attributions: Union[Unset, list[str]] = UNSET
    max_license_risk: Union[None, Unset, str] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        id = self.id

        canonical_name = self.canonical_name

        object_kind = self.object_kind

        family = self.family

        type_ = self.type_

        priority_class = self.priority_class

        license_taint = self.license_taint

        macro_region: Union[None, Unset, str]
        if isinstance(self.macro_region, Unset):
            macro_region = UNSET
        else:
            macro_region = self.macro_region

        required_attributions: Union[Unset, list[str]] = UNSET
        if not isinstance(self.required_attributions, Unset):
            required_attributions = self.required_attributions



        max_license_risk: Union[None, Unset, str]
        if isinstance(self.max_license_risk, Unset):
            max_license_risk = UNSET
        else:
            max_license_risk = self.max_license_risk


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "id": id,
            "canonical_name": canonical_name,
            "object_kind": object_kind,
            "family": family,
            "type": type_,
            "priority_class": priority_class,
            "license_taint": license_taint,
        })
        if macro_region is not UNSET:
            field_dict["macro_region"] = macro_region
        if required_attributions is not UNSET:
            field_dict["required_attributions"] = required_attributions
        if max_license_risk is not UNSET:
            field_dict["max_license_risk"] = max_license_risk

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        canonical_name = d.pop("canonical_name")

        object_kind = d.pop("object_kind")

        family = d.pop("family")

        type_ = d.pop("type")

        priority_class = d.pop("priority_class")

        license_taint = d.pop("license_taint")

        def _parse_macro_region(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        macro_region = _parse_macro_region(d.pop("macro_region", UNSET))


        required_attributions = cast(list[str], d.pop("required_attributions", UNSET))


        def _parse_max_license_risk(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        max_license_risk = _parse_max_license_risk(d.pop("max_license_risk", UNSET))


        chokepoint_summary = cls(
            id=id,
            canonical_name=canonical_name,
            object_kind=object_kind,
            family=family,
            type_=type_,
            priority_class=priority_class,
            license_taint=license_taint,
            macro_region=macro_region,
            required_attributions=required_attributions,
            max_license_risk=max_license_risk,
        )


        chokepoint_summary.additional_properties = d
        return chokepoint_summary

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
