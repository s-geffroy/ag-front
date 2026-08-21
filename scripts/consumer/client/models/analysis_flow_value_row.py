from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="AnalysisFlowValueRow")



@_attrs_define
class AnalysisFlowValueRow:
    """ One `flow_value` row (`analytics.flow_value_result`).

        Attributes:
            flow_type (Union[None, Unset, str]):
            value_usd (Union[None, Unset, float]):
            method (Union[None, Unset, str]):
            price_ref (Union[None, Unset, str]):
            confidence (Union[None, Unset, str]):
            volume_basis (Union[None, Unset, str]):
     """

    flow_type: Union[None, Unset, str] = UNSET
    value_usd: Union[None, Unset, float] = UNSET
    method: Union[None, Unset, str] = UNSET
    price_ref: Union[None, Unset, str] = UNSET
    confidence: Union[None, Unset, str] = UNSET
    volume_basis: Union[None, Unset, str] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        flow_type: Union[None, Unset, str]
        if isinstance(self.flow_type, Unset):
            flow_type = UNSET
        else:
            flow_type = self.flow_type

        value_usd: Union[None, Unset, float]
        if isinstance(self.value_usd, Unset):
            value_usd = UNSET
        else:
            value_usd = self.value_usd

        method: Union[None, Unset, str]
        if isinstance(self.method, Unset):
            method = UNSET
        else:
            method = self.method

        price_ref: Union[None, Unset, str]
        if isinstance(self.price_ref, Unset):
            price_ref = UNSET
        else:
            price_ref = self.price_ref

        confidence: Union[None, Unset, str]
        if isinstance(self.confidence, Unset):
            confidence = UNSET
        else:
            confidence = self.confidence

        volume_basis: Union[None, Unset, str]
        if isinstance(self.volume_basis, Unset):
            volume_basis = UNSET
        else:
            volume_basis = self.volume_basis


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if flow_type is not UNSET:
            field_dict["flow_type"] = flow_type
        if value_usd is not UNSET:
            field_dict["value_usd"] = value_usd
        if method is not UNSET:
            field_dict["method"] = method
        if price_ref is not UNSET:
            field_dict["price_ref"] = price_ref
        if confidence is not UNSET:
            field_dict["confidence"] = confidence
        if volume_basis is not UNSET:
            field_dict["volume_basis"] = volume_basis

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        def _parse_flow_type(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        flow_type = _parse_flow_type(d.pop("flow_type", UNSET))


        def _parse_value_usd(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        value_usd = _parse_value_usd(d.pop("value_usd", UNSET))


        def _parse_method(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        method = _parse_method(d.pop("method", UNSET))


        def _parse_price_ref(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        price_ref = _parse_price_ref(d.pop("price_ref", UNSET))


        def _parse_confidence(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        confidence = _parse_confidence(d.pop("confidence", UNSET))


        def _parse_volume_basis(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        volume_basis = _parse_volume_basis(d.pop("volume_basis", UNSET))


        analysis_flow_value_row = cls(
            flow_type=flow_type,
            value_usd=value_usd,
            method=method,
            price_ref=price_ref,
            confidence=confidence,
            volume_basis=volume_basis,
        )


        analysis_flow_value_row.additional_properties = d
        return analysis_flow_value_row

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
