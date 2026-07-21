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
  from ..models.news_cluster_out import NewsClusterOut





T = TypeVar("T", bound="NewsFeedOut")



@_attrs_define
class NewsFeedOut:
    """ The latest aggregation snapshot. Served from ONE taint partition, never a union of both:
    a `read` principal sees the `cleared_only` pass, a `read_tainted` principal asking for
    include_tainted sees the richer `all_sources` pass INSTEAD — so no event is returned twice.

        Attributes:
            count (int):
            run_id (Union[None, Unset, str]):
            taint_class (Union[None, Unset, str]):
            generated_at (Union[None, Unset, datetime.datetime]):
            include_tainted (Union[Unset, bool]):  Default: False.
            items (Union[Unset, list['NewsClusterOut']]):
            run_notes (Union[Unset, list[str]]):
            disclaimer (Union[Unset, str]):  Default: "Derived news context (ADR 0076): media articles grouped by event and
                summarised by an LLM. Candidate/derived output, never canonical and never human-validated. The prose (headline,
                summary) is model-authored and may be wrong; every fact below it — the article list, counts, outlets, dates and
                chokepoint links — is recomputed server-side from the collected signals. Press coverage is NEVER proof of a
                closure: it is capped at `stress` by the regime engine, so a cluster reporting a strait 'closed' records what
                media REPORT, not an established fact.".
            attribution_notice (Union[Unset, str]):  Default: 'Records may require source attribution. Redistribution-
                restricted (tainted) records are excluded by default; pass include_tainted=true to include them.'.
     """

    count: int
    run_id: Union[None, Unset, str] = UNSET
    taint_class: Union[None, Unset, str] = UNSET
    generated_at: Union[None, Unset, datetime.datetime] = UNSET
    include_tainted: Union[Unset, bool] = False
    items: Union[Unset, list['NewsClusterOut']] = UNSET
    run_notes: Union[Unset, list[str]] = UNSET
    disclaimer: Union[Unset, str] = "Derived news context (ADR 0076): media articles grouped by event and summarised by an LLM. Candidate/derived output, never canonical and never human-validated. The prose (headline, summary) is model-authored and may be wrong; every fact below it — the article list, counts, outlets, dates and chokepoint links — is recomputed server-side from the collected signals. Press coverage is NEVER proof of a closure: it is capped at `stress` by the regime engine, so a cluster reporting a strait 'closed' records what media REPORT, not an established fact."
    attribution_notice: Union[Unset, str] = 'Records may require source attribution. Redistribution-restricted (tainted) records are excluded by default; pass include_tainted=true to include them.'
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        from ..models.news_cluster_out import NewsClusterOut
        count = self.count

        run_id: Union[None, Unset, str]
        if isinstance(self.run_id, Unset):
            run_id = UNSET
        else:
            run_id = self.run_id

        taint_class: Union[None, Unset, str]
        if isinstance(self.taint_class, Unset):
            taint_class = UNSET
        else:
            taint_class = self.taint_class

        generated_at: Union[None, Unset, str]
        if isinstance(self.generated_at, Unset):
            generated_at = UNSET
        elif isinstance(self.generated_at, datetime.datetime):
            generated_at = self.generated_at.isoformat()
        else:
            generated_at = self.generated_at

        include_tainted = self.include_tainted

        items: Union[Unset, list[dict[str, Any]]] = UNSET
        if not isinstance(self.items, Unset):
            items = []
            for items_item_data in self.items:
                items_item = items_item_data.to_dict()
                items.append(items_item)



        run_notes: Union[Unset, list[str]] = UNSET
        if not isinstance(self.run_notes, Unset):
            run_notes = self.run_notes



        disclaimer = self.disclaimer

        attribution_notice = self.attribution_notice


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "count": count,
        })
        if run_id is not UNSET:
            field_dict["run_id"] = run_id
        if taint_class is not UNSET:
            field_dict["taint_class"] = taint_class
        if generated_at is not UNSET:
            field_dict["generated_at"] = generated_at
        if include_tainted is not UNSET:
            field_dict["include_tainted"] = include_tainted
        if items is not UNSET:
            field_dict["items"] = items
        if run_notes is not UNSET:
            field_dict["run_notes"] = run_notes
        if disclaimer is not UNSET:
            field_dict["disclaimer"] = disclaimer
        if attribution_notice is not UNSET:
            field_dict["attribution_notice"] = attribution_notice

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.news_cluster_out import NewsClusterOut
        d = dict(src_dict)
        count = d.pop("count")

        def _parse_run_id(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        run_id = _parse_run_id(d.pop("run_id", UNSET))


        def _parse_taint_class(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        taint_class = _parse_taint_class(d.pop("taint_class", UNSET))


        def _parse_generated_at(data: object) -> Union[None, Unset, datetime.datetime]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                generated_at_type_0 = isoparse(data)



                return generated_at_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, Unset, datetime.datetime], data)

        generated_at = _parse_generated_at(d.pop("generated_at", UNSET))


        include_tainted = d.pop("include_tainted", UNSET)

        items = []
        _items = d.pop("items", UNSET)
        for items_item_data in (_items or []):
            items_item = NewsClusterOut.from_dict(items_item_data)



            items.append(items_item)


        run_notes = cast(list[str], d.pop("run_notes", UNSET))


        disclaimer = d.pop("disclaimer", UNSET)

        attribution_notice = d.pop("attribution_notice", UNSET)

        news_feed_out = cls(
            count=count,
            run_id=run_id,
            taint_class=taint_class,
            generated_at=generated_at,
            include_tainted=include_tainted,
            items=items,
            run_notes=run_notes,
            disclaimer=disclaimer,
            attribution_notice=attribution_notice,
        )


        news_feed_out.additional_properties = d
        return news_feed_out

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
