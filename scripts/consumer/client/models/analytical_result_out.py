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






T = TypeVar("T", bound="AnalyticalResultOut")



@_attrs_define
class AnalyticalResultOut:
    """ 
        Attributes:
            id (str):
            run_id (str):
            engine_id (str):
            engine_version (str):
            input_snapshot_id (str):
            object_id (str):
            result_type (str):
            status (str):
            object_type (Union[None, Unset, str]):
            score (Union[None, Unset, float]):
            confidence (Union[None, Unset, str]):
            result_summary (Union[None, Unset, str]):
            result_payload (Union[Any, None, Unset]):
            generated_at (Union[None, Unset, datetime.datetime]):
            disclaimer (Union[Unset, str]):  Default: 'Analytical results are derived, candidate outputs (not human-
                validated) and are never written back to canonical without a review gate.'.
     """

    id: str
    run_id: str
    engine_id: str
    engine_version: str
    input_snapshot_id: str
    object_id: str
    result_type: str
    status: str
    object_type: Union[None, Unset, str] = UNSET
    score: Union[None, Unset, float] = UNSET
    confidence: Union[None, Unset, str] = UNSET
    result_summary: Union[None, Unset, str] = UNSET
    result_payload: Union[Any, None, Unset] = UNSET
    generated_at: Union[None, Unset, datetime.datetime] = UNSET
    disclaimer: Union[Unset, str] = 'Analytical results are derived, candidate outputs (not human-validated) and are never written back to canonical without a review gate.'
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        id = self.id

        run_id = self.run_id

        engine_id = self.engine_id

        engine_version = self.engine_version

        input_snapshot_id = self.input_snapshot_id

        object_id = self.object_id

        result_type = self.result_type

        status = self.status

        object_type: Union[None, Unset, str]
        if isinstance(self.object_type, Unset):
            object_type = UNSET
        else:
            object_type = self.object_type

        score: Union[None, Unset, float]
        if isinstance(self.score, Unset):
            score = UNSET
        else:
            score = self.score

        confidence: Union[None, Unset, str]
        if isinstance(self.confidence, Unset):
            confidence = UNSET
        else:
            confidence = self.confidence

        result_summary: Union[None, Unset, str]
        if isinstance(self.result_summary, Unset):
            result_summary = UNSET
        else:
            result_summary = self.result_summary

        result_payload: Union[Any, None, Unset]
        if isinstance(self.result_payload, Unset):
            result_payload = UNSET
        else:
            result_payload = self.result_payload

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
            "run_id": run_id,
            "engine_id": engine_id,
            "engine_version": engine_version,
            "input_snapshot_id": input_snapshot_id,
            "object_id": object_id,
            "result_type": result_type,
            "status": status,
        })
        if object_type is not UNSET:
            field_dict["object_type"] = object_type
        if score is not UNSET:
            field_dict["score"] = score
        if confidence is not UNSET:
            field_dict["confidence"] = confidence
        if result_summary is not UNSET:
            field_dict["result_summary"] = result_summary
        if result_payload is not UNSET:
            field_dict["result_payload"] = result_payload
        if generated_at is not UNSET:
            field_dict["generated_at"] = generated_at
        if disclaimer is not UNSET:
            field_dict["disclaimer"] = disclaimer

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        run_id = d.pop("run_id")

        engine_id = d.pop("engine_id")

        engine_version = d.pop("engine_version")

        input_snapshot_id = d.pop("input_snapshot_id")

        object_id = d.pop("object_id")

        result_type = d.pop("result_type")

        status = d.pop("status")

        def _parse_object_type(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        object_type = _parse_object_type(d.pop("object_type", UNSET))


        def _parse_score(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        score = _parse_score(d.pop("score", UNSET))


        def _parse_confidence(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        confidence = _parse_confidence(d.pop("confidence", UNSET))


        def _parse_result_summary(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        result_summary = _parse_result_summary(d.pop("result_summary", UNSET))


        def _parse_result_payload(data: object) -> Union[Any, None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[Any, None, Unset], data)

        result_payload = _parse_result_payload(d.pop("result_payload", UNSET))


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

        analytical_result_out = cls(
            id=id,
            run_id=run_id,
            engine_id=engine_id,
            engine_version=engine_version,
            input_snapshot_id=input_snapshot_id,
            object_id=object_id,
            result_type=result_type,
            status=status,
            object_type=object_type,
            score=score,
            confidence=confidence,
            result_summary=result_summary,
            result_payload=result_payload,
            generated_at=generated_at,
            disclaimer=disclaimer,
        )


        analytical_result_out.additional_properties = d
        return analytical_result_out

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
