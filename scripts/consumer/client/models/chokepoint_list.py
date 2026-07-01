from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast
from typing import Union

if TYPE_CHECKING:
  from ..models.chokepoint_summary import ChokepointSummary





T = TypeVar("T", bound="ChokepointList")



@_attrs_define
class ChokepointList:
    """ 
        Attributes:
            count (int):
            include_tainted (bool):
            attribution_notice (Union[Unset, str]):  Default: 'Records may require source attribution. Redistribution-
                restricted (tainted) records are excluded by default; pass include_tainted=true to include them.'.
            items (Union[Unset, list['ChokepointSummary']]):
     """

    count: int
    include_tainted: bool
    attribution_notice: Union[Unset, str] = 'Records may require source attribution. Redistribution-restricted (tainted) records are excluded by default; pass include_tainted=true to include them.'
    items: Union[Unset, list['ChokepointSummary']] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        from ..models.chokepoint_summary import ChokepointSummary
        count = self.count

        include_tainted = self.include_tainted

        attribution_notice = self.attribution_notice

        items: Union[Unset, list[dict[str, Any]]] = UNSET
        if not isinstance(self.items, Unset):
            items = []
            for items_item_data in self.items:
                items_item = items_item_data.to_dict()
                items.append(items_item)




        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "count": count,
            "include_tainted": include_tainted,
        })
        if attribution_notice is not UNSET:
            field_dict["attribution_notice"] = attribution_notice
        if items is not UNSET:
            field_dict["items"] = items

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.chokepoint_summary import ChokepointSummary
        d = dict(src_dict)
        count = d.pop("count")

        include_tainted = d.pop("include_tainted")

        attribution_notice = d.pop("attribution_notice", UNSET)

        items = []
        _items = d.pop("items", UNSET)
        for items_item_data in (_items or []):
            items_item = ChokepointSummary.from_dict(items_item_data)



            items.append(items_item)


        chokepoint_list = cls(
            count=count,
            include_tainted=include_tainted,
            attribution_notice=attribution_notice,
            items=items,
        )


        chokepoint_list.additional_properties = d
        return chokepoint_list

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
