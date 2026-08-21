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






T = TypeVar("T", bound="StateSummaryOut")



@_attrs_define
class StateSummaryOut:
    """ One figure over the curated core — a COUNT OF CATEGORIES, not a mean of `tension_pct`.

    Averaging values declared non-comparable would contradict the declaration. This counts objects whose
    regime engine put them above `open`, over the objects that have a regime row at all — and serves
    `objects_without_regime` beside it, because that is the honest denominator: most of the core has no
    regime assessment, and a share computed over the covered few must not be read as a share of the core.

        Attributes:
            objects_above_normal (int):
            objects_with_regime (int):
            objects_without_regime (int):
            core_total (int):
            stale_regime_rows (int):
            generated_at (datetime.datetime):
            share_above_normal_pct (Union[None, Unset, float]):
     """

    objects_above_normal: int
    objects_with_regime: int
    objects_without_regime: int
    core_total: int
    stale_regime_rows: int
    generated_at: datetime.datetime
    share_above_normal_pct: Union[None, Unset, float] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        objects_above_normal = self.objects_above_normal

        objects_with_regime = self.objects_with_regime

        objects_without_regime = self.objects_without_regime

        core_total = self.core_total

        stale_regime_rows = self.stale_regime_rows

        generated_at = self.generated_at.isoformat()

        share_above_normal_pct: Union[None, Unset, float]
        if isinstance(self.share_above_normal_pct, Unset):
            share_above_normal_pct = UNSET
        else:
            share_above_normal_pct = self.share_above_normal_pct


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "objects_above_normal": objects_above_normal,
            "objects_with_regime": objects_with_regime,
            "objects_without_regime": objects_without_regime,
            "core_total": core_total,
            "stale_regime_rows": stale_regime_rows,
            "generated_at": generated_at,
        })
        if share_above_normal_pct is not UNSET:
            field_dict["share_above_normal_pct"] = share_above_normal_pct

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        objects_above_normal = d.pop("objects_above_normal")

        objects_with_regime = d.pop("objects_with_regime")

        objects_without_regime = d.pop("objects_without_regime")

        core_total = d.pop("core_total")

        stale_regime_rows = d.pop("stale_regime_rows")

        generated_at = isoparse(d.pop("generated_at"))




        def _parse_share_above_normal_pct(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        share_above_normal_pct = _parse_share_above_normal_pct(d.pop("share_above_normal_pct", UNSET))


        state_summary_out = cls(
            objects_above_normal=objects_above_normal,
            objects_with_regime=objects_with_regime,
            objects_without_regime=objects_without_regime,
            core_total=core_total,
            stale_regime_rows=stale_regime_rows,
            generated_at=generated_at,
            share_above_normal_pct=share_above_normal_pct,
        )


        state_summary_out.additional_properties = d
        return state_summary_out

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
