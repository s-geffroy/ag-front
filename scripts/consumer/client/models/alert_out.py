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






T = TypeVar("T", bound="AlertOut")



@_attrs_define
class AlertOut:
    """ 
        Attributes:
            id (str):
            chokepoint_id (str):
            alert_type (str):
            level (str):
            time_horizon (str):
            queue (str):
            trigger_summary (str):
            review_status (str):
            canonical_name (Union[None, Unset, str]):
            affected_dimensions (Union[Unset, list[str]]):
            affected_actors (Union[Unset, list[str]]):
            confidence (Union[None, Unset, str]):
            generated_at (Union[None, Unset, datetime.datetime]):
            disclaimer (Union[Unset, str]):  Default: 'Analytical results are derived, candidate outputs (not human-
                validated) and are never written back to canonical without a review gate.'.
     """

    id: str
    chokepoint_id: str
    alert_type: str
    level: str
    time_horizon: str
    queue: str
    trigger_summary: str
    review_status: str
    canonical_name: Union[None, Unset, str] = UNSET
    affected_dimensions: Union[Unset, list[str]] = UNSET
    affected_actors: Union[Unset, list[str]] = UNSET
    confidence: Union[None, Unset, str] = UNSET
    generated_at: Union[None, Unset, datetime.datetime] = UNSET
    disclaimer: Union[Unset, str] = 'Analytical results are derived, candidate outputs (not human-validated) and are never written back to canonical without a review gate.'
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        id = self.id

        chokepoint_id = self.chokepoint_id

        alert_type = self.alert_type

        level = self.level

        time_horizon = self.time_horizon

        queue = self.queue

        trigger_summary = self.trigger_summary

        review_status = self.review_status

        canonical_name: Union[None, Unset, str]
        if isinstance(self.canonical_name, Unset):
            canonical_name = UNSET
        else:
            canonical_name = self.canonical_name

        affected_dimensions: Union[Unset, list[str]] = UNSET
        if not isinstance(self.affected_dimensions, Unset):
            affected_dimensions = self.affected_dimensions



        affected_actors: Union[Unset, list[str]] = UNSET
        if not isinstance(self.affected_actors, Unset):
            affected_actors = self.affected_actors



        confidence: Union[None, Unset, str]
        if isinstance(self.confidence, Unset):
            confidence = UNSET
        else:
            confidence = self.confidence

        generated_at: Union[None, Unset, str]
        if isinstance(self.generated_at, Unset):
            generated_at = UNSET
        elif isinstance(self.generated_at, datetime.datetime):
            generated_at = self.generated_at.isoformat()
        else:
            generated_at = self.generated_at

        disclaimer = self.disclaimer


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "id": id,
            "chokepoint_id": chokepoint_id,
            "alert_type": alert_type,
            "level": level,
            "time_horizon": time_horizon,
            "queue": queue,
            "trigger_summary": trigger_summary,
            "review_status": review_status,
        })
        if canonical_name is not UNSET:
            field_dict["canonical_name"] = canonical_name
        if affected_dimensions is not UNSET:
            field_dict["affected_dimensions"] = affected_dimensions
        if affected_actors is not UNSET:
            field_dict["affected_actors"] = affected_actors
        if confidence is not UNSET:
            field_dict["confidence"] = confidence
        if generated_at is not UNSET:
            field_dict["generated_at"] = generated_at
        if disclaimer is not UNSET:
            field_dict["disclaimer"] = disclaimer

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        chokepoint_id = d.pop("chokepoint_id")

        alert_type = d.pop("alert_type")

        level = d.pop("level")

        time_horizon = d.pop("time_horizon")

        queue = d.pop("queue")

        trigger_summary = d.pop("trigger_summary")

        review_status = d.pop("review_status")

        def _parse_canonical_name(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        canonical_name = _parse_canonical_name(d.pop("canonical_name", UNSET))


        affected_dimensions = cast(list[str], d.pop("affected_dimensions", UNSET))


        affected_actors = cast(list[str], d.pop("affected_actors", UNSET))


        def _parse_confidence(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        confidence = _parse_confidence(d.pop("confidence", UNSET))


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


        disclaimer = d.pop("disclaimer", UNSET)

        alert_out = cls(
            id=id,
            chokepoint_id=chokepoint_id,
            alert_type=alert_type,
            level=level,
            time_horizon=time_horizon,
            queue=queue,
            trigger_summary=trigger_summary,
            review_status=review_status,
            canonical_name=canonical_name,
            affected_dimensions=affected_dimensions,
            affected_actors=affected_actors,
            confidence=confidence,
            generated_at=generated_at,
            disclaimer=disclaimer,
        )


        alert_out.additional_properties = d
        return alert_out

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
