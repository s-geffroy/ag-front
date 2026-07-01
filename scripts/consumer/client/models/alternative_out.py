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
  from ..models.reroute_delta_out import RerouteDeltaOut





T = TypeVar("T", bound="AlternativeOut")



@_attrs_define
class AlternativeOut:
    """ 
        Attributes:
            description (str):
            target_object_id (Union[None, Unset, str]):
            affected_flows (Union[Unset, list[str]]):
            cost_penalty (Union[None, Unset, str]):
            time_penalty (Union[None, Unset, str]):
            capacity_penalty (Union[None, Unset, str]):
            feasibility (Union[None, Unset, str]):
            substitution_note (Union[None, Unset, str]):
            validation_status (Union[None, Unset, str]):
            reroute_deltas (Union[Unset, list['RerouteDeltaOut']]):
     """

    description: str
    target_object_id: Union[None, Unset, str] = UNSET
    affected_flows: Union[Unset, list[str]] = UNSET
    cost_penalty: Union[None, Unset, str] = UNSET
    time_penalty: Union[None, Unset, str] = UNSET
    capacity_penalty: Union[None, Unset, str] = UNSET
    feasibility: Union[None, Unset, str] = UNSET
    substitution_note: Union[None, Unset, str] = UNSET
    validation_status: Union[None, Unset, str] = UNSET
    reroute_deltas: Union[Unset, list['RerouteDeltaOut']] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        from ..models.reroute_delta_out import RerouteDeltaOut
        description = self.description

        target_object_id: Union[None, Unset, str]
        if isinstance(self.target_object_id, Unset):
            target_object_id = UNSET
        else:
            target_object_id = self.target_object_id

        affected_flows: Union[Unset, list[str]] = UNSET
        if not isinstance(self.affected_flows, Unset):
            affected_flows = self.affected_flows



        cost_penalty: Union[None, Unset, str]
        if isinstance(self.cost_penalty, Unset):
            cost_penalty = UNSET
        else:
            cost_penalty = self.cost_penalty

        time_penalty: Union[None, Unset, str]
        if isinstance(self.time_penalty, Unset):
            time_penalty = UNSET
        else:
            time_penalty = self.time_penalty

        capacity_penalty: Union[None, Unset, str]
        if isinstance(self.capacity_penalty, Unset):
            capacity_penalty = UNSET
        else:
            capacity_penalty = self.capacity_penalty

        feasibility: Union[None, Unset, str]
        if isinstance(self.feasibility, Unset):
            feasibility = UNSET
        else:
            feasibility = self.feasibility

        substitution_note: Union[None, Unset, str]
        if isinstance(self.substitution_note, Unset):
            substitution_note = UNSET
        else:
            substitution_note = self.substitution_note

        validation_status: Union[None, Unset, str]
        if isinstance(self.validation_status, Unset):
            validation_status = UNSET
        else:
            validation_status = self.validation_status

        reroute_deltas: Union[Unset, list[dict[str, Any]]] = UNSET
        if not isinstance(self.reroute_deltas, Unset):
            reroute_deltas = []
            for reroute_deltas_item_data in self.reroute_deltas:
                reroute_deltas_item = reroute_deltas_item_data.to_dict()
                reroute_deltas.append(reroute_deltas_item)




        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "description": description,
        })
        if target_object_id is not UNSET:
            field_dict["target_object_id"] = target_object_id
        if affected_flows is not UNSET:
            field_dict["affected_flows"] = affected_flows
        if cost_penalty is not UNSET:
            field_dict["cost_penalty"] = cost_penalty
        if time_penalty is not UNSET:
            field_dict["time_penalty"] = time_penalty
        if capacity_penalty is not UNSET:
            field_dict["capacity_penalty"] = capacity_penalty
        if feasibility is not UNSET:
            field_dict["feasibility"] = feasibility
        if substitution_note is not UNSET:
            field_dict["substitution_note"] = substitution_note
        if validation_status is not UNSET:
            field_dict["validation_status"] = validation_status
        if reroute_deltas is not UNSET:
            field_dict["reroute_deltas"] = reroute_deltas

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.reroute_delta_out import RerouteDeltaOut
        d = dict(src_dict)
        description = d.pop("description")

        def _parse_target_object_id(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        target_object_id = _parse_target_object_id(d.pop("target_object_id", UNSET))


        affected_flows = cast(list[str], d.pop("affected_flows", UNSET))


        def _parse_cost_penalty(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        cost_penalty = _parse_cost_penalty(d.pop("cost_penalty", UNSET))


        def _parse_time_penalty(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        time_penalty = _parse_time_penalty(d.pop("time_penalty", UNSET))


        def _parse_capacity_penalty(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        capacity_penalty = _parse_capacity_penalty(d.pop("capacity_penalty", UNSET))


        def _parse_feasibility(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        feasibility = _parse_feasibility(d.pop("feasibility", UNSET))


        def _parse_substitution_note(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        substitution_note = _parse_substitution_note(d.pop("substitution_note", UNSET))


        def _parse_validation_status(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        validation_status = _parse_validation_status(d.pop("validation_status", UNSET))


        reroute_deltas = []
        _reroute_deltas = d.pop("reroute_deltas", UNSET)
        for reroute_deltas_item_data in (_reroute_deltas or []):
            reroute_deltas_item = RerouteDeltaOut.from_dict(reroute_deltas_item_data)



            reroute_deltas.append(reroute_deltas_item)


        alternative_out = cls(
            description=description,
            target_object_id=target_object_id,
            affected_flows=affected_flows,
            cost_penalty=cost_penalty,
            time_penalty=time_penalty,
            capacity_penalty=capacity_penalty,
            feasibility=feasibility,
            substitution_note=substitution_note,
            validation_status=validation_status,
            reroute_deltas=reroute_deltas,
        )


        alternative_out.additional_properties = d
        return alternative_out

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
