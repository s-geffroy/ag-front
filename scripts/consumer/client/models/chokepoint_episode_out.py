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






T = TypeVar("T", bound="ChokepointEpisodeOut")



@_attrs_define
class ChokepointEpisodeOut:
    """ A disruption episode as seen from one of its affected chokepoints.

        Attributes:
            episode_key (str):
            name (str):
            status (str):
            started_on (Union[None, Unset, datetime.date]):
            ended_on (Union[None, Unset, datetime.date]):
            severity (Union[None, Unset, str]):
            object_role (Union[None, Unset, str]):
     """

    episode_key: str
    name: str
    status: str
    started_on: Union[None, Unset, datetime.date] = UNSET
    ended_on: Union[None, Unset, datetime.date] = UNSET
    severity: Union[None, Unset, str] = UNSET
    object_role: Union[None, Unset, str] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        episode_key = self.episode_key

        name = self.name

        status = self.status

        started_on: Union[None, Unset, str]
        if isinstance(self.started_on, Unset):
            started_on = UNSET
        elif isinstance(self.started_on, datetime.date):
            started_on = self.started_on.isoformat()
        else:
            started_on = self.started_on

        ended_on: Union[None, Unset, str]
        if isinstance(self.ended_on, Unset):
            ended_on = UNSET
        elif isinstance(self.ended_on, datetime.date):
            ended_on = self.ended_on.isoformat()
        else:
            ended_on = self.ended_on

        severity: Union[None, Unset, str]
        if isinstance(self.severity, Unset):
            severity = UNSET
        else:
            severity = self.severity

        object_role: Union[None, Unset, str]
        if isinstance(self.object_role, Unset):
            object_role = UNSET
        else:
            object_role = self.object_role


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "episode_key": episode_key,
            "name": name,
            "status": status,
        })
        if started_on is not UNSET:
            field_dict["started_on"] = started_on
        if ended_on is not UNSET:
            field_dict["ended_on"] = ended_on
        if severity is not UNSET:
            field_dict["severity"] = severity
        if object_role is not UNSET:
            field_dict["object_role"] = object_role

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        episode_key = d.pop("episode_key")

        name = d.pop("name")

        status = d.pop("status")

        def _parse_started_on(data: object) -> Union[None, Unset, datetime.date]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                started_on_type_0 = isoparse(data).date()



                return started_on_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, Unset, datetime.date], data)

        started_on = _parse_started_on(d.pop("started_on", UNSET))


        def _parse_ended_on(data: object) -> Union[None, Unset, datetime.date]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                ended_on_type_0 = isoparse(data).date()



                return ended_on_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, Unset, datetime.date], data)

        ended_on = _parse_ended_on(d.pop("ended_on", UNSET))


        def _parse_severity(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        severity = _parse_severity(d.pop("severity", UNSET))


        def _parse_object_role(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        object_role = _parse_object_role(d.pop("object_role", UNSET))


        chokepoint_episode_out = cls(
            episode_key=episode_key,
            name=name,
            status=status,
            started_on=started_on,
            ended_on=ended_on,
            severity=severity,
            object_role=object_role,
        )


        chokepoint_episode_out.additional_properties = d
        return chokepoint_episode_out

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
