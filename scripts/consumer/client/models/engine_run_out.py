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






T = TypeVar("T", bound="EngineRunOut")



@_attrs_define
class EngineRunOut:
    """ 
        Attributes:
            run_id (str):
            engine_id (str):
            engine_version (str):
            input_snapshot_id (str):
            status (str):
            started_at (Union[None, Unset, datetime.datetime]):
            finished_at (Union[None, Unset, datetime.datetime]):
            output_result_count (Union[None, Unset, int]):
            error_message (Union[None, Unset, str]):
     """

    run_id: str
    engine_id: str
    engine_version: str
    input_snapshot_id: str
    status: str
    started_at: Union[None, Unset, datetime.datetime] = UNSET
    finished_at: Union[None, Unset, datetime.datetime] = UNSET
    output_result_count: Union[None, Unset, int] = UNSET
    error_message: Union[None, Unset, str] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        run_id = self.run_id

        engine_id = self.engine_id

        engine_version = self.engine_version

        input_snapshot_id = self.input_snapshot_id

        status = self.status

        started_at: Union[None, Unset, str]
        if isinstance(self.started_at, Unset):
            started_at = UNSET
        elif isinstance(self.started_at, datetime.datetime):
            started_at = self.started_at.isoformat()
        else:
            started_at = self.started_at

        finished_at: Union[None, Unset, str]
        if isinstance(self.finished_at, Unset):
            finished_at = UNSET
        elif isinstance(self.finished_at, datetime.datetime):
            finished_at = self.finished_at.isoformat()
        else:
            finished_at = self.finished_at

        output_result_count: Union[None, Unset, int]
        if isinstance(self.output_result_count, Unset):
            output_result_count = UNSET
        else:
            output_result_count = self.output_result_count

        error_message: Union[None, Unset, str]
        if isinstance(self.error_message, Unset):
            error_message = UNSET
        else:
            error_message = self.error_message


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "run_id": run_id,
            "engine_id": engine_id,
            "engine_version": engine_version,
            "input_snapshot_id": input_snapshot_id,
            "status": status,
        })
        if started_at is not UNSET:
            field_dict["started_at"] = started_at
        if finished_at is not UNSET:
            field_dict["finished_at"] = finished_at
        if output_result_count is not UNSET:
            field_dict["output_result_count"] = output_result_count
        if error_message is not UNSET:
            field_dict["error_message"] = error_message

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        run_id = d.pop("run_id")

        engine_id = d.pop("engine_id")

        engine_version = d.pop("engine_version")

        input_snapshot_id = d.pop("input_snapshot_id")

        status = d.pop("status")

        def _parse_started_at(data: object) -> Union[None, Unset, datetime.datetime]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                started_at_type_0 = isoparse(data)



                return started_at_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, Unset, datetime.datetime], data)

        started_at = _parse_started_at(d.pop("started_at", UNSET))


        def _parse_finished_at(data: object) -> Union[None, Unset, datetime.datetime]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                finished_at_type_0 = isoparse(data)



                return finished_at_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, Unset, datetime.datetime], data)

        finished_at = _parse_finished_at(d.pop("finished_at", UNSET))


        def _parse_output_result_count(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        output_result_count = _parse_output_result_count(d.pop("output_result_count", UNSET))


        def _parse_error_message(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        error_message = _parse_error_message(d.pop("error_message", UNSET))


        engine_run_out = cls(
            run_id=run_id,
            engine_id=engine_id,
            engine_version=engine_version,
            input_snapshot_id=input_snapshot_id,
            status=status,
            started_at=started_at,
            finished_at=finished_at,
            output_result_count=output_result_count,
            error_message=error_message,
        )


        engine_run_out.additional_properties = d
        return engine_run_out

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
