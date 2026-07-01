from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="RerouteDeltaOut")



@_attrs_define
class RerouteDeltaOut:
    """ Per-flow reroute delta (searoute, schematic): added transit days + estimated added
    voyage cost (bunkers ∝ distance + charter hire ∝ days), net of the canal toll the reroute
    avoids (or incurs). The cost band is taken from net_cost_usd.

        Attributes:
            flow_type (str):
            vessel_class (Union[None, Unset, str]):
            delta_days (Union[None, Unset, float]):
            delta_cost_usd (Union[None, Unset, float]):
            toll_saved_usd (Union[None, Unset, float]):
            net_cost_usd (Union[None, Unset, float]):
            suggested_cost_penalty (Union[None, Unset, str]):
            corridor (Union[None, Unset, str]):
     """

    flow_type: str
    vessel_class: Union[None, Unset, str] = UNSET
    delta_days: Union[None, Unset, float] = UNSET
    delta_cost_usd: Union[None, Unset, float] = UNSET
    toll_saved_usd: Union[None, Unset, float] = UNSET
    net_cost_usd: Union[None, Unset, float] = UNSET
    suggested_cost_penalty: Union[None, Unset, str] = UNSET
    corridor: Union[None, Unset, str] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        flow_type = self.flow_type

        vessel_class: Union[None, Unset, str]
        if isinstance(self.vessel_class, Unset):
            vessel_class = UNSET
        else:
            vessel_class = self.vessel_class

        delta_days: Union[None, Unset, float]
        if isinstance(self.delta_days, Unset):
            delta_days = UNSET
        else:
            delta_days = self.delta_days

        delta_cost_usd: Union[None, Unset, float]
        if isinstance(self.delta_cost_usd, Unset):
            delta_cost_usd = UNSET
        else:
            delta_cost_usd = self.delta_cost_usd

        toll_saved_usd: Union[None, Unset, float]
        if isinstance(self.toll_saved_usd, Unset):
            toll_saved_usd = UNSET
        else:
            toll_saved_usd = self.toll_saved_usd

        net_cost_usd: Union[None, Unset, float]
        if isinstance(self.net_cost_usd, Unset):
            net_cost_usd = UNSET
        else:
            net_cost_usd = self.net_cost_usd

        suggested_cost_penalty: Union[None, Unset, str]
        if isinstance(self.suggested_cost_penalty, Unset):
            suggested_cost_penalty = UNSET
        else:
            suggested_cost_penalty = self.suggested_cost_penalty

        corridor: Union[None, Unset, str]
        if isinstance(self.corridor, Unset):
            corridor = UNSET
        else:
            corridor = self.corridor


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "flow_type": flow_type,
        })
        if vessel_class is not UNSET:
            field_dict["vessel_class"] = vessel_class
        if delta_days is not UNSET:
            field_dict["delta_days"] = delta_days
        if delta_cost_usd is not UNSET:
            field_dict["delta_cost_usd"] = delta_cost_usd
        if toll_saved_usd is not UNSET:
            field_dict["toll_saved_usd"] = toll_saved_usd
        if net_cost_usd is not UNSET:
            field_dict["net_cost_usd"] = net_cost_usd
        if suggested_cost_penalty is not UNSET:
            field_dict["suggested_cost_penalty"] = suggested_cost_penalty
        if corridor is not UNSET:
            field_dict["corridor"] = corridor

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        flow_type = d.pop("flow_type")

        def _parse_vessel_class(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        vessel_class = _parse_vessel_class(d.pop("vessel_class", UNSET))


        def _parse_delta_days(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        delta_days = _parse_delta_days(d.pop("delta_days", UNSET))


        def _parse_delta_cost_usd(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        delta_cost_usd = _parse_delta_cost_usd(d.pop("delta_cost_usd", UNSET))


        def _parse_toll_saved_usd(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        toll_saved_usd = _parse_toll_saved_usd(d.pop("toll_saved_usd", UNSET))


        def _parse_net_cost_usd(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        net_cost_usd = _parse_net_cost_usd(d.pop("net_cost_usd", UNSET))


        def _parse_suggested_cost_penalty(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        suggested_cost_penalty = _parse_suggested_cost_penalty(d.pop("suggested_cost_penalty", UNSET))


        def _parse_corridor(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        corridor = _parse_corridor(d.pop("corridor", UNSET))


        reroute_delta_out = cls(
            flow_type=flow_type,
            vessel_class=vessel_class,
            delta_days=delta_days,
            delta_cost_usd=delta_cost_usd,
            toll_saved_usd=toll_saved_usd,
            net_cost_usd=net_cost_usd,
            suggested_cost_penalty=suggested_cost_penalty,
            corridor=corridor,
        )


        reroute_delta_out.additional_properties = d
        return reroute_delta_out

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
