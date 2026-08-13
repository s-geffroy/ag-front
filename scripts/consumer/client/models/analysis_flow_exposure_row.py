from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="AnalysisFlowExposureRow")



@_attrs_define
class AnalysisFlowExposureRow:
    """ One `flow_exposure` row (`analytics.flow_exposure_result`).

        Attributes:
            exposed_flow_type (Union[None, Unset, str]):
            exposure_score (Union[None, Unset, int]):
            quantification_status (Union[None, Unset, str]):
            estimated_volume (Union[None, Unset, float]):
            unit (Union[None, Unset, str]):
     """

    exposed_flow_type: Union[None, Unset, str] = UNSET
    exposure_score: Union[None, Unset, int] = UNSET
    quantification_status: Union[None, Unset, str] = UNSET
    estimated_volume: Union[None, Unset, float] = UNSET
    unit: Union[None, Unset, str] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        exposed_flow_type: Union[None, Unset, str]
        if isinstance(self.exposed_flow_type, Unset):
            exposed_flow_type = UNSET
        else:
            exposed_flow_type = self.exposed_flow_type

        exposure_score: Union[None, Unset, int]
        if isinstance(self.exposure_score, Unset):
            exposure_score = UNSET
        else:
            exposure_score = self.exposure_score

        quantification_status: Union[None, Unset, str]
        if isinstance(self.quantification_status, Unset):
            quantification_status = UNSET
        else:
            quantification_status = self.quantification_status

        estimated_volume: Union[None, Unset, float]
        if isinstance(self.estimated_volume, Unset):
            estimated_volume = UNSET
        else:
            estimated_volume = self.estimated_volume

        unit: Union[None, Unset, str]
        if isinstance(self.unit, Unset):
            unit = UNSET
        else:
            unit = self.unit


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if exposed_flow_type is not UNSET:
            field_dict["exposed_flow_type"] = exposed_flow_type
        if exposure_score is not UNSET:
            field_dict["exposure_score"] = exposure_score
        if quantification_status is not UNSET:
            field_dict["quantification_status"] = quantification_status
        if estimated_volume is not UNSET:
            field_dict["estimated_volume"] = estimated_volume
        if unit is not UNSET:
            field_dict["unit"] = unit

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        def _parse_exposed_flow_type(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        exposed_flow_type = _parse_exposed_flow_type(d.pop("exposed_flow_type", UNSET))


        def _parse_exposure_score(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        exposure_score = _parse_exposure_score(d.pop("exposure_score", UNSET))


        def _parse_quantification_status(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        quantification_status = _parse_quantification_status(d.pop("quantification_status", UNSET))


        def _parse_estimated_volume(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        estimated_volume = _parse_estimated_volume(d.pop("estimated_volume", UNSET))


        def _parse_unit(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        unit = _parse_unit(d.pop("unit", UNSET))


        analysis_flow_exposure_row = cls(
            exposed_flow_type=exposed_flow_type,
            exposure_score=exposure_score,
            quantification_status=quantification_status,
            estimated_volume=estimated_volume,
            unit=unit,
        )


        analysis_flow_exposure_row.additional_properties = d
        return analysis_flow_exposure_row

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
