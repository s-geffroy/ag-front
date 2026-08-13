from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="AnalysisSystemCascadeRow")



@_attrs_define
class AnalysisSystemCascadeRow:
    """ One `system_cascade` row (`analytics.system_cascade_result`).

        Attributes:
            cascade_score (Union[None, Unset, int]):
            key_dependency_objects (Union[None, Unset, list[str]]):
            alternative_routes (Union[None, Unset, list[str]]):
     """

    cascade_score: Union[None, Unset, int] = UNSET
    key_dependency_objects: Union[None, Unset, list[str]] = UNSET
    alternative_routes: Union[None, Unset, list[str]] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        cascade_score: Union[None, Unset, int]
        if isinstance(self.cascade_score, Unset):
            cascade_score = UNSET
        else:
            cascade_score = self.cascade_score

        key_dependency_objects: Union[None, Unset, list[str]]
        if isinstance(self.key_dependency_objects, Unset):
            key_dependency_objects = UNSET
        elif isinstance(self.key_dependency_objects, list):
            key_dependency_objects = self.key_dependency_objects


        else:
            key_dependency_objects = self.key_dependency_objects

        alternative_routes: Union[None, Unset, list[str]]
        if isinstance(self.alternative_routes, Unset):
            alternative_routes = UNSET
        elif isinstance(self.alternative_routes, list):
            alternative_routes = self.alternative_routes


        else:
            alternative_routes = self.alternative_routes


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if cascade_score is not UNSET:
            field_dict["cascade_score"] = cascade_score
        if key_dependency_objects is not UNSET:
            field_dict["key_dependency_objects"] = key_dependency_objects
        if alternative_routes is not UNSET:
            field_dict["alternative_routes"] = alternative_routes

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        def _parse_cascade_score(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        cascade_score = _parse_cascade_score(d.pop("cascade_score", UNSET))


        def _parse_key_dependency_objects(data: object) -> Union[None, Unset, list[str]]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                key_dependency_objects_type_0 = cast(list[str], data)

                return key_dependency_objects_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, Unset, list[str]], data)

        key_dependency_objects = _parse_key_dependency_objects(d.pop("key_dependency_objects", UNSET))


        def _parse_alternative_routes(data: object) -> Union[None, Unset, list[str]]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                alternative_routes_type_0 = cast(list[str], data)

                return alternative_routes_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, Unset, list[str]], data)

        alternative_routes = _parse_alternative_routes(d.pop("alternative_routes", UNSET))


        analysis_system_cascade_row = cls(
            cascade_score=cascade_score,
            key_dependency_objects=key_dependency_objects,
            alternative_routes=alternative_routes,
        )


        analysis_system_cascade_row.additional_properties = d
        return analysis_system_cascade_row

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
