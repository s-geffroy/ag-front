from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast
from typing import Union

if TYPE_CHECKING:
  from ..models.strategic_flow_unit_summary import StrategicFlowUnitSummary





T = TypeVar("T", bound="StrategicFlowUnitList")



@_attrs_define
class StrategicFlowUnitList:
    """ 
        Attributes:
            count (int):
            items (list['StrategicFlowUnitSummary']):
            disclaimer (Union[Unset, str]):  Default: 'Analytical results are derived, candidate outputs (not human-
                validated) and are never written back to canonical without a review gate.'.
     """

    count: int
    items: list['StrategicFlowUnitSummary']
    disclaimer: Union[Unset, str] = 'Analytical results are derived, candidate outputs (not human-validated) and are never written back to canonical without a review gate.'
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        from ..models.strategic_flow_unit_summary import StrategicFlowUnitSummary
        count = self.count

        items = []
        for items_item_data in self.items:
            items_item = items_item_data.to_dict()
            items.append(items_item)



        disclaimer = self.disclaimer


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "count": count,
            "items": items,
        })
        if disclaimer is not UNSET:
            field_dict["disclaimer"] = disclaimer

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.strategic_flow_unit_summary import StrategicFlowUnitSummary
        d = dict(src_dict)
        count = d.pop("count")

        items = []
        _items = d.pop("items")
        for items_item_data in (_items):
            items_item = StrategicFlowUnitSummary.from_dict(items_item_data)



            items.append(items_item)


        disclaimer = d.pop("disclaimer", UNSET)

        strategic_flow_unit_list = cls(
            count=count,
            items=items,
            disclaimer=disclaimer,
        )


        strategic_flow_unit_list.additional_properties = d
        return strategic_flow_unit_list

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
