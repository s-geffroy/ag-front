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
  from ..models.strategic_flow_unit_summary import StrategicFlowUnitSummary





T = TypeVar("T", bound="StrategicFlowUnitList")



@_attrs_define
class StrategicFlowUnitList:
    """ 
        Attributes:
            returned (int):
            total_count (int):
            truncated (bool):
            generated_at (datetime.datetime):
            count (int):
            items (list['StrategicFlowUnitSummary']):
            limit (Union[None, Unset, int]):
            disclaimer (Union[Unset, str]):  Default: 'Analytical results are derived, candidate outputs (not human-
                validated) and are never written back to canonical without a review gate.'.
     """

    returned: int
    total_count: int
    truncated: bool
    generated_at: datetime.datetime
    count: int
    items: list['StrategicFlowUnitSummary']
    limit: Union[None, Unset, int] = UNSET
    disclaimer: Union[Unset, str] = 'Analytical results are derived, candidate outputs (not human-validated) and are never written back to canonical without a review gate.'
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        from ..models.strategic_flow_unit_summary import StrategicFlowUnitSummary
        returned = self.returned

        total_count = self.total_count

        truncated = self.truncated

        generated_at = self.generated_at.isoformat()

        count = self.count

        items = []
        for items_item_data in self.items:
            items_item = items_item_data.to_dict()
            items.append(items_item)



        limit: Union[None, Unset, int]
        if isinstance(self.limit, Unset):
            limit = UNSET
        else:
            limit = self.limit

        disclaimer = self.disclaimer


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "returned": returned,
            "total_count": total_count,
            "truncated": truncated,
            "generated_at": generated_at,
            "count": count,
            "items": items,
        })
        if limit is not UNSET:
            field_dict["limit"] = limit
        if disclaimer is not UNSET:
            field_dict["disclaimer"] = disclaimer

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.strategic_flow_unit_summary import StrategicFlowUnitSummary
        d = dict(src_dict)
        returned = d.pop("returned")

        total_count = d.pop("total_count")

        truncated = d.pop("truncated")

        generated_at = isoparse(d.pop("generated_at"))




        count = d.pop("count")

        items = []
        _items = d.pop("items")
        for items_item_data in (_items):
            items_item = StrategicFlowUnitSummary.from_dict(items_item_data)



            items.append(items_item)


        def _parse_limit(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        limit = _parse_limit(d.pop("limit", UNSET))


        disclaimer = d.pop("disclaimer", UNSET)

        strategic_flow_unit_list = cls(
            returned=returned,
            total_count=total_count,
            truncated=truncated,
            generated_at=generated_at,
            count=count,
            items=items,
            limit=limit,
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
