from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="MetricOut")



@_attrs_define
class MetricOut:
    """ 
        Attributes:
            metric_key (str):
            metric_label (Union[None, Unset, str]):
            metric_kind (Union[None, Unset, str]):
            value (Union[None, Unset, float]):
            rank (Union[None, Unset, int]):
            unit (Union[None, Unset, str]):
            period (Union[None, Unset, str]):
            source_id (Union[None, Unset, str]):
            url (Union[None, Unset, str]):
            notes (Union[None, Unset, str]):
            sources (Union[Unset, list[str]]):
     """

    metric_key: str
    metric_label: Union[None, Unset, str] = UNSET
    metric_kind: Union[None, Unset, str] = UNSET
    value: Union[None, Unset, float] = UNSET
    rank: Union[None, Unset, int] = UNSET
    unit: Union[None, Unset, str] = UNSET
    period: Union[None, Unset, str] = UNSET
    source_id: Union[None, Unset, str] = UNSET
    url: Union[None, Unset, str] = UNSET
    notes: Union[None, Unset, str] = UNSET
    sources: Union[Unset, list[str]] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        metric_key = self.metric_key

        metric_label: Union[None, Unset, str]
        if isinstance(self.metric_label, Unset):
            metric_label = UNSET
        else:
            metric_label = self.metric_label

        metric_kind: Union[None, Unset, str]
        if isinstance(self.metric_kind, Unset):
            metric_kind = UNSET
        else:
            metric_kind = self.metric_kind

        value: Union[None, Unset, float]
        if isinstance(self.value, Unset):
            value = UNSET
        else:
            value = self.value

        rank: Union[None, Unset, int]
        if isinstance(self.rank, Unset):
            rank = UNSET
        else:
            rank = self.rank

        unit: Union[None, Unset, str]
        if isinstance(self.unit, Unset):
            unit = UNSET
        else:
            unit = self.unit

        period: Union[None, Unset, str]
        if isinstance(self.period, Unset):
            period = UNSET
        else:
            period = self.period

        source_id: Union[None, Unset, str]
        if isinstance(self.source_id, Unset):
            source_id = UNSET
        else:
            source_id = self.source_id

        url: Union[None, Unset, str]
        if isinstance(self.url, Unset):
            url = UNSET
        else:
            url = self.url

        notes: Union[None, Unset, str]
        if isinstance(self.notes, Unset):
            notes = UNSET
        else:
            notes = self.notes

        sources: Union[Unset, list[str]] = UNSET
        if not isinstance(self.sources, Unset):
            sources = self.sources




        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "metric_key": metric_key,
        })
        if metric_label is not UNSET:
            field_dict["metric_label"] = metric_label
        if metric_kind is not UNSET:
            field_dict["metric_kind"] = metric_kind
        if value is not UNSET:
            field_dict["value"] = value
        if rank is not UNSET:
            field_dict["rank"] = rank
        if unit is not UNSET:
            field_dict["unit"] = unit
        if period is not UNSET:
            field_dict["period"] = period
        if source_id is not UNSET:
            field_dict["source_id"] = source_id
        if url is not UNSET:
            field_dict["url"] = url
        if notes is not UNSET:
            field_dict["notes"] = notes
        if sources is not UNSET:
            field_dict["sources"] = sources

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        metric_key = d.pop("metric_key")

        def _parse_metric_label(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        metric_label = _parse_metric_label(d.pop("metric_label", UNSET))


        def _parse_metric_kind(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        metric_kind = _parse_metric_kind(d.pop("metric_kind", UNSET))


        def _parse_value(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        value = _parse_value(d.pop("value", UNSET))


        def _parse_rank(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        rank = _parse_rank(d.pop("rank", UNSET))


        def _parse_unit(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        unit = _parse_unit(d.pop("unit", UNSET))


        def _parse_period(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        period = _parse_period(d.pop("period", UNSET))


        def _parse_source_id(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        source_id = _parse_source_id(d.pop("source_id", UNSET))


        def _parse_url(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        url = _parse_url(d.pop("url", UNSET))


        def _parse_notes(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        notes = _parse_notes(d.pop("notes", UNSET))


        sources = cast(list[str], d.pop("sources", UNSET))


        metric_out = cls(
            metric_key=metric_key,
            metric_label=metric_label,
            metric_kind=metric_kind,
            value=value,
            rank=rank,
            unit=unit,
            period=period,
            source_id=source_id,
            url=url,
            notes=notes,
            sources=sources,
        )


        metric_out.additional_properties = d
        return metric_out

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
