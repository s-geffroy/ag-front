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
    """ The chokepoint page. `count` is the PAGE size and always was; `total_count` is how many match.

    Nobody ever reported the ambiguity, which is the point: a field named `count` next to `items` reads as
    a total until the day someone paginates and the numbers stop adding up (ADR 0098). `count` is kept —
    removing it would break every consumer — but it is no longer the only number here.

        Attributes:
            count (int):
            include_tainted (bool):
            total_count (Union[Unset, int]):  Default: 0.
            attribution_notice (Union[Unset, str]):  Default: 'Records may require source attribution. Redistribution-
                restricted (tainted) records are excluded by default; pass include_tainted=true to include them.'.
            items (Union[Unset, list['ChokepointSummary']]):
     """

    count: int
    include_tainted: bool
    total_count: Union[Unset, int] = 0
    attribution_notice: Union[Unset, str] = 'Records may require source attribution. Redistribution-restricted (tainted) records are excluded by default; pass include_tainted=true to include them.'
    items: Union[Unset, list['ChokepointSummary']] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        from ..models.chokepoint_summary import ChokepointSummary
        count = self.count

        include_tainted = self.include_tainted

        total_count = self.total_count

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
        if total_count is not UNSET:
            field_dict["total_count"] = total_count
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

        total_count = d.pop("total_count", UNSET)

        attribution_notice = d.pop("attribution_notice", UNSET)

        items = []
        _items = d.pop("items", UNSET)
        for items_item_data in (_items or []):
            items_item = ChokepointSummary.from_dict(items_item_data)



            items.append(items_item)


        chokepoint_list = cls(
            count=count,
            include_tainted=include_tainted,
            total_count=total_count,
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
