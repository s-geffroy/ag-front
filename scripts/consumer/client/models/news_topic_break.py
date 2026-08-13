from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset







T = TypeVar("T", bound="NewsTopicBreak")



@_attrs_define
class NewsTopicBreak:
    """ Why a `topic_id` is new: because the SUBJECT is new, or because the chain snapped (ADR 0101).

    Present only in the second case. `topic_matched_by` stays `new` either way — widening a response enum
    breaks a consumer that parses it strictly, so the distinction rides here: `topic_break: null` means
    nothing overlapped at all, a genuinely new subject.

    `candidate_urls_dropped_by_cap` is the honest half of ag-front's objection (`0035` §4): the chain
    compares CAPPED samples, and on a busy day the cap drops over a thousand bulk articles. When the
    predecessor's articles are the ones that were dropped, the break is a CAPACITY artefact rather than an
    editorial one — and the most-covered topic is the most exposed to it. We cannot recompute the overlap
    before capping (a cluster only exists over what the model was given), so we report how much of the
    predecessor this pass never looked at.

        Attributes:
            best_containment (float):
            shared_urls (int):
            candidate_urls (int):
            candidate_urls_dropped_by_cap (int):
     """

    best_containment: float
    shared_urls: int
    candidate_urls: int
    candidate_urls_dropped_by_cap: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        best_containment = self.best_containment

        shared_urls = self.shared_urls

        candidate_urls = self.candidate_urls

        candidate_urls_dropped_by_cap = self.candidate_urls_dropped_by_cap


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "best_containment": best_containment,
            "shared_urls": shared_urls,
            "candidate_urls": candidate_urls,
            "candidate_urls_dropped_by_cap": candidate_urls_dropped_by_cap,
        })

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        best_containment = d.pop("best_containment")

        shared_urls = d.pop("shared_urls")

        candidate_urls = d.pop("candidate_urls")

        candidate_urls_dropped_by_cap = d.pop("candidate_urls_dropped_by_cap")

        news_topic_break = cls(
            best_containment=best_containment,
            shared_urls=shared_urls,
            candidate_urls=candidate_urls,
            candidate_urls_dropped_by_cap=candidate_urls_dropped_by_cap,
        )


        news_topic_break.additional_properties = d
        return news_topic_break

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
