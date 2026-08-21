from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset







T = TypeVar("T", bound="StateCoverage")



@_attrs_define
class StateCoverage:
    """ How many components actually stand behind the figures. A high tension over one component is not
    the same claim as the same tension over five.

        Attributes:
            observed (int):
            stale (int):
            no_data (int):
            total (int):
            tension_components_used (int):
     """

    observed: int
    stale: int
    no_data: int
    total: int
    tension_components_used: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        observed = self.observed

        stale = self.stale

        no_data = self.no_data

        total = self.total

        tension_components_used = self.tension_components_used


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "observed": observed,
            "stale": stale,
            "no_data": no_data,
            "total": total,
            "tension_components_used": tension_components_used,
        })

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        observed = d.pop("observed")

        stale = d.pop("stale")

        no_data = d.pop("no_data")

        total = d.pop("total")

        tension_components_used = d.pop("tension_components_used")

        state_coverage = cls(
            observed=observed,
            stale=stale,
            no_data=no_data,
            total=total,
            tension_components_used=tension_components_used,
        )


        state_coverage.additional_properties = d
        return state_coverage

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
