from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union

if TYPE_CHECKING:
  from ..models.derived_relation_graph_out_by_origin import DerivedRelationGraphOutByOrigin
  from ..models.derived_relation_out import DerivedRelationOut





T = TypeVar("T", bound="DerivedRelationGraphOut")



@_attrs_define
class DerivedRelationGraphOut:
    """ 
        Attributes:
            edge_count_total (int):
            returned (int):
            total_count (Union[None, Unset, int]):
            truncated (Union[None, Unset, bool]):
            limit (Union[None, Unset, int]):
            status (Union[None, Unset, str]):
            generated_from (Union[None, Unset, str]):
            by_origin (Union[Unset, DerivedRelationGraphOutByOrigin]):
            items (Union[Unset, list['DerivedRelationOut']]):
            disclaimer (Union[Unset, str]):  Default: "Derived candidate strategic-relations graph (ADR 0065, piste 1):
                edges extracted from the analysis fiches, pending human validation — NOT canonical. Distinct from /relations
                (canonical, human-validated). Targets flagged 'external_candidate' are coverage gaps, not corpus objects. No
                canonical mutation or priority promotion. Never merge into seed/strategic_relations.yaml without human
                validation.".
     """

    edge_count_total: int
    returned: int
    total_count: Union[None, Unset, int] = UNSET
    truncated: Union[None, Unset, bool] = UNSET
    limit: Union[None, Unset, int] = UNSET
    status: Union[None, Unset, str] = UNSET
    generated_from: Union[None, Unset, str] = UNSET
    by_origin: Union[Unset, 'DerivedRelationGraphOutByOrigin'] = UNSET
    items: Union[Unset, list['DerivedRelationOut']] = UNSET
    disclaimer: Union[Unset, str] = "Derived candidate strategic-relations graph (ADR 0065, piste 1): edges extracted from the analysis fiches, pending human validation — NOT canonical. Distinct from /relations (canonical, human-validated). Targets flagged 'external_candidate' are coverage gaps, not corpus objects. No canonical mutation or priority promotion. Never merge into seed/strategic_relations.yaml without human validation."
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        from ..models.derived_relation_graph_out_by_origin import DerivedRelationGraphOutByOrigin
        from ..models.derived_relation_out import DerivedRelationOut
        edge_count_total = self.edge_count_total

        returned = self.returned

        total_count: Union[None, Unset, int]
        if isinstance(self.total_count, Unset):
            total_count = UNSET
        else:
            total_count = self.total_count

        truncated: Union[None, Unset, bool]
        if isinstance(self.truncated, Unset):
            truncated = UNSET
        else:
            truncated = self.truncated

        limit: Union[None, Unset, int]
        if isinstance(self.limit, Unset):
            limit = UNSET
        else:
            limit = self.limit

        status: Union[None, Unset, str]
        if isinstance(self.status, Unset):
            status = UNSET
        else:
            status = self.status

        generated_from: Union[None, Unset, str]
        if isinstance(self.generated_from, Unset):
            generated_from = UNSET
        else:
            generated_from = self.generated_from

        by_origin: Union[Unset, dict[str, Any]] = UNSET
        if not isinstance(self.by_origin, Unset):
            by_origin = self.by_origin.to_dict()

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
            "edge_count_total": edge_count_total,
            "returned": returned,
        })
        if total_count is not UNSET:
            field_dict["total_count"] = total_count
        if truncated is not UNSET:
            field_dict["truncated"] = truncated
        if limit is not UNSET:
            field_dict["limit"] = limit
        if status is not UNSET:
            field_dict["status"] = status
        if generated_from is not UNSET:
            field_dict["generated_from"] = generated_from
        if by_origin is not UNSET:
            field_dict["by_origin"] = by_origin
        if items is not UNSET:
            field_dict["items"] = items
        if disclaimer is not UNSET:
            field_dict["disclaimer"] = disclaimer

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.derived_relation_graph_out_by_origin import DerivedRelationGraphOutByOrigin
        from ..models.derived_relation_out import DerivedRelationOut
        d = dict(src_dict)
        edge_count_total = d.pop("edge_count_total")

        returned = d.pop("returned")

        def _parse_total_count(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        total_count = _parse_total_count(d.pop("total_count", UNSET))


        def _parse_truncated(data: object) -> Union[None, Unset, bool]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, bool], data)

        truncated = _parse_truncated(d.pop("truncated", UNSET))


        def _parse_limit(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        limit = _parse_limit(d.pop("limit", UNSET))


        def _parse_status(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        status = _parse_status(d.pop("status", UNSET))


        def _parse_generated_from(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        generated_from = _parse_generated_from(d.pop("generated_from", UNSET))


        _by_origin = d.pop("by_origin", UNSET)
        by_origin: Union[Unset, DerivedRelationGraphOutByOrigin]
        if isinstance(_by_origin,  Unset):
            by_origin = UNSET
        else:
            by_origin = DerivedRelationGraphOutByOrigin.from_dict(_by_origin)




        items = []
        _items = d.pop("items", UNSET)
        for items_item_data in (_items or []):
            items_item = DerivedRelationOut.from_dict(items_item_data)



            items.append(items_item)


        disclaimer = d.pop("disclaimer", UNSET)

        derived_relation_graph_out = cls(
            edge_count_total=edge_count_total,
            returned=returned,
            total_count=total_count,
            truncated=truncated,
            limit=limit,
            status=status,
            generated_from=generated_from,
            by_origin=by_origin,
            items=items,
            disclaimer=disclaimer,
        )


        derived_relation_graph_out.additional_properties = d
        return derived_relation_graph_out

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
