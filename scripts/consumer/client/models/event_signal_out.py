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






T = TypeVar("T", bound="EventSignalOut")



@_attrs_define
class EventSignalOut:
    """ 
        Attributes:
            chokepoint_id (str):
            domain (str):
            weight (Union[None, Unset, float]):
            observed_on (Union[None, Unset, datetime.date]):
            event_key (Union[None, Unset, str]):
     """

    chokepoint_id: str
    domain: str
    weight: Union[None, Unset, float] = UNSET
    observed_on: Union[None, Unset, datetime.date] = UNSET
    event_key: Union[None, Unset, str] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        chokepoint_id = self.chokepoint_id

        domain = self.domain

        weight: Union[None, Unset, float]
        if isinstance(self.weight, Unset):
            weight = UNSET
        else:
            weight = self.weight

        observed_on: Union[None, Unset, str]
        if isinstance(self.observed_on, Unset):
            observed_on = UNSET
        elif isinstance(self.observed_on, datetime.date):
            observed_on = self.observed_on.isoformat()
        else:
            observed_on = self.observed_on

        event_key: Union[None, Unset, str]
        if isinstance(self.event_key, Unset):
            event_key = UNSET
        else:
            event_key = self.event_key


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "chokepoint_id": chokepoint_id,
            "domain": domain,
        })
        if weight is not UNSET:
            field_dict["weight"] = weight
        if observed_on is not UNSET:
            field_dict["observed_on"] = observed_on
        if event_key is not UNSET:
            field_dict["event_key"] = event_key

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        chokepoint_id = d.pop("chokepoint_id")

        domain = d.pop("domain")

        def _parse_weight(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        weight = _parse_weight(d.pop("weight", UNSET))


        def _parse_observed_on(data: object) -> Union[None, Unset, datetime.date]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                observed_on_type_0 = isoparse(data).date()



                return observed_on_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, Unset, datetime.date], data)

        observed_on = _parse_observed_on(d.pop("observed_on", UNSET))


        def _parse_event_key(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        event_key = _parse_event_key(d.pop("event_key", UNSET))


        event_signal_out = cls(
            chokepoint_id=chokepoint_id,
            domain=domain,
            weight=weight,
            observed_on=observed_on,
            event_key=event_key,
        )


        event_signal_out.additional_properties = d
        return event_signal_out

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
