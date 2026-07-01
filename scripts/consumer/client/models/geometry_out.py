from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="GeometryOut")



@_attrs_define
class GeometryOut:
    """ 
        Attributes:
            geometry_role (str):
            geometry_status (str):
            geom_geojson (Union[Any, None, Unset]):
     """

    geometry_role: str
    geometry_status: str
    geom_geojson: Union[Any, None, Unset] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        geometry_role = self.geometry_role

        geometry_status = self.geometry_status

        geom_geojson: Union[Any, None, Unset]
        if isinstance(self.geom_geojson, Unset):
            geom_geojson = UNSET
        else:
            geom_geojson = self.geom_geojson


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "geometry_role": geometry_role,
            "geometry_status": geometry_status,
        })
        if geom_geojson is not UNSET:
            field_dict["geom_geojson"] = geom_geojson

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        geometry_role = d.pop("geometry_role")

        geometry_status = d.pop("geometry_status")

        def _parse_geom_geojson(data: object) -> Union[Any, None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[Any, None, Unset], data)

        geom_geojson = _parse_geom_geojson(d.pop("geom_geojson", UNSET))


        geometry_out = cls(
            geometry_role=geometry_role,
            geometry_status=geometry_status,
            geom_geojson=geom_geojson,
        )


        geometry_out.additional_properties = d
        return geometry_out

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
