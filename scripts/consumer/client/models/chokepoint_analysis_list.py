from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast
from typing import Union

if TYPE_CHECKING:
  from ..models.chokepoint_analysis_summary import ChokepointAnalysisSummary





T = TypeVar("T", bound="ChokepointAnalysisList")



@_attrs_define
class ChokepointAnalysisList:
    """ 
        Attributes:
            count (int):
            items (Union[Unset, list['ChokepointAnalysisSummary']]):
            disclaimer (Union[Unset, str]):  Default: 'Derived systemic analysis (Theory of Constraints + Leverage Points,
                ADR 0027/0028). Figures are unvalidated public order-of-magnitude candidates pending human validation;
                capacities and geometry are schematic. No canonical mutation or priority promotion.'.
     """

    count: int
    items: Union[Unset, list['ChokepointAnalysisSummary']] = UNSET
    disclaimer: Union[Unset, str] = 'Derived systemic analysis (Theory of Constraints + Leverage Points, ADR 0027/0028). Figures are unvalidated public order-of-magnitude candidates pending human validation; capacities and geometry are schematic. No canonical mutation or priority promotion.'
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        from ..models.chokepoint_analysis_summary import ChokepointAnalysisSummary
        count = self.count

        items: Union[Unset, list[dict[str, Any]]] = UNSET
        if not isinstance(self.items, Unset):
            items = []
            for items_item_data in self.items:
                items_item = items_item_data.to_dict()
                items.append(items_item)



        disclaimer = self.disclaimer


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "count": count,
        })
        if items is not UNSET:
            field_dict["items"] = items
        if disclaimer is not UNSET:
            field_dict["disclaimer"] = disclaimer

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.chokepoint_analysis_summary import ChokepointAnalysisSummary
        d = dict(src_dict)
        count = d.pop("count")

        items = []
        _items = d.pop("items", UNSET)
        for items_item_data in (_items or []):
            items_item = ChokepointAnalysisSummary.from_dict(items_item_data)



            items.append(items_item)


        disclaimer = d.pop("disclaimer", UNSET)

        chokepoint_analysis_list = cls(
            count=count,
            items=items,
            disclaimer=disclaimer,
        )


        chokepoint_analysis_list.additional_properties = d
        return chokepoint_analysis_list

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
