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

if TYPE_CHECKING:
  from ..models.source_out import SourceOut





T = TypeVar("T", bound="SourceList")



@_attrs_define
class SourceList:
    """ 
        Attributes:
            returned (int):
            total_count (int):
            truncated (bool):
            generated_at (datetime.datetime):
            limit (Union[None, Unset, int]):
            items (Union[Unset, list['SourceOut']]):
     """

    returned: int
    total_count: int
    truncated: bool
    generated_at: datetime.datetime
    limit: Union[None, Unset, int] = UNSET
    items: Union[Unset, list['SourceOut']] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        from ..models.source_out import SourceOut
        returned = self.returned

        total_count = self.total_count

        truncated = self.truncated

        generated_at = self.generated_at.isoformat()

        limit: Union[None, Unset, int]
        if isinstance(self.limit, Unset):
            limit = UNSET
        else:
            limit = self.limit

        items: Union[Unset, list[dict[str, Any]]] = UNSET
        if not isinstance(self.items, Unset):
            items = []
            for items_item_data in self.items:
                items_item = items_item_data.to_dict()
                items.append(items_item)




        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "returned": returned,
            "total_count": total_count,
            "truncated": truncated,
            "generated_at": generated_at,
        })
        if limit is not UNSET:
            field_dict["limit"] = limit
        if items is not UNSET:
            field_dict["items"] = items

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.source_out import SourceOut
        d = dict(src_dict)
        returned = d.pop("returned")

        total_count = d.pop("total_count")

        truncated = d.pop("truncated")

        generated_at = isoparse(d.pop("generated_at"))




        def _parse_limit(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        limit = _parse_limit(d.pop("limit", UNSET))


        items = []
        _items = d.pop("items", UNSET)
        for items_item_data in (_items or []):
            items_item = SourceOut.from_dict(items_item_data)



            items.append(items_item)


        source_list = cls(
            returned=returned,
            total_count=total_count,
            truncated=truncated,
            generated_at=generated_at,
            limit=limit,
            items=items,
        )


        source_list.additional_properties = d
        return source_list

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
