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
  from ..models.episode_member_out import EpisodeMemberOut





T = TypeVar("T", bound="EpisodeDetail")



@_attrs_define
class EpisodeDetail:
    """ 
        Attributes:
            episode_key (str):
            name (str):
            status (str):
            description (Union[None, Unset, str]):
            started_on (Union[None, Unset, datetime.date]):
            ended_on (Union[None, Unset, datetime.date]):
            severity (Union[None, Unset, str]):
            affected_flows (Union[Unset, list[str]]):
            object_count (Union[Unset, int]):  Default: 0.
            members (Union[Unset, list['EpisodeMemberOut']]):
     """

    episode_key: str
    name: str
    status: str
    description: Union[None, Unset, str] = UNSET
    started_on: Union[None, Unset, datetime.date] = UNSET
    ended_on: Union[None, Unset, datetime.date] = UNSET
    severity: Union[None, Unset, str] = UNSET
    affected_flows: Union[Unset, list[str]] = UNSET
    object_count: Union[Unset, int] = 0
    members: Union[Unset, list['EpisodeMemberOut']] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        from ..models.episode_member_out import EpisodeMemberOut
        episode_key = self.episode_key

        name = self.name

        status = self.status

        description: Union[None, Unset, str]
        if isinstance(self.description, Unset):
            description = UNSET
        else:
            description = self.description

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

        affected_flows: Union[Unset, list[str]] = UNSET
        if not isinstance(self.affected_flows, Unset):
            affected_flows = self.affected_flows



        object_count = self.object_count

        members: Union[Unset, list[dict[str, Any]]] = UNSET
        if not isinstance(self.members, Unset):
            members = []
            for members_item_data in self.members:
                members_item = members_item_data.to_dict()
                members.append(members_item)




        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "episode_key": episode_key,
            "name": name,
            "status": status,
        })
        if description is not UNSET:
            field_dict["description"] = description
        if started_on is not UNSET:
            field_dict["started_on"] = started_on
        if ended_on is not UNSET:
            field_dict["ended_on"] = ended_on
        if severity is not UNSET:
            field_dict["severity"] = severity
        if affected_flows is not UNSET:
            field_dict["affected_flows"] = affected_flows
        if object_count is not UNSET:
            field_dict["object_count"] = object_count
        if members is not UNSET:
            field_dict["members"] = members

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.episode_member_out import EpisodeMemberOut
        d = dict(src_dict)
        episode_key = d.pop("episode_key")

        name = d.pop("name")

        status = d.pop("status")

        def _parse_description(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        description = _parse_description(d.pop("description", UNSET))


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


        affected_flows = cast(list[str], d.pop("affected_flows", UNSET))


        object_count = d.pop("object_count", UNSET)

        members = []
        _members = d.pop("members", UNSET)
        for members_item_data in (_members or []):
            members_item = EpisodeMemberOut.from_dict(members_item_data)



            members.append(members_item)


        episode_detail = cls(
            episode_key=episode_key,
            name=name,
            status=status,
            description=description,
            started_on=started_on,
            ended_on=ended_on,
            severity=severity,
            affected_flows=affected_flows,
            object_count=object_count,
            members=members,
        )


        episode_detail.additional_properties = d
        return episode_detail

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
