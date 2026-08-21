from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="AnalysisExposedTradeLossRow")



@_attrs_define
class AnalysisExposedTradeLossRow:
    """ One `exposed_trade_loss` row (`analytics.exposed_trade_loss_result`).

        Attributes:
            exposed_value_usd (Union[None, Unset, float]):
            value_source (Union[None, Unset, str]):
            expected_value_at_risk_usd (Union[None, Unset, float]):
            scenario_closure_loss_usd (Union[None, Unset, float]):
            closure_days (Union[None, Unset, int]):
            daily_loss_rate_usd (Union[None, Unset, float]):
            confidence (Union[None, Unset, str]):
     """

    exposed_value_usd: Union[None, Unset, float] = UNSET
    value_source: Union[None, Unset, str] = UNSET
    expected_value_at_risk_usd: Union[None, Unset, float] = UNSET
    scenario_closure_loss_usd: Union[None, Unset, float] = UNSET
    closure_days: Union[None, Unset, int] = UNSET
    daily_loss_rate_usd: Union[None, Unset, float] = UNSET
    confidence: Union[None, Unset, str] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        exposed_value_usd: Union[None, Unset, float]
        if isinstance(self.exposed_value_usd, Unset):
            exposed_value_usd = UNSET
        else:
            exposed_value_usd = self.exposed_value_usd

        value_source: Union[None, Unset, str]
        if isinstance(self.value_source, Unset):
            value_source = UNSET
        else:
            value_source = self.value_source

        expected_value_at_risk_usd: Union[None, Unset, float]
        if isinstance(self.expected_value_at_risk_usd, Unset):
            expected_value_at_risk_usd = UNSET
        else:
            expected_value_at_risk_usd = self.expected_value_at_risk_usd

        scenario_closure_loss_usd: Union[None, Unset, float]
        if isinstance(self.scenario_closure_loss_usd, Unset):
            scenario_closure_loss_usd = UNSET
        else:
            scenario_closure_loss_usd = self.scenario_closure_loss_usd

        closure_days: Union[None, Unset, int]
        if isinstance(self.closure_days, Unset):
            closure_days = UNSET
        else:
            closure_days = self.closure_days

        daily_loss_rate_usd: Union[None, Unset, float]
        if isinstance(self.daily_loss_rate_usd, Unset):
            daily_loss_rate_usd = UNSET
        else:
            daily_loss_rate_usd = self.daily_loss_rate_usd

        confidence: Union[None, Unset, str]
        if isinstance(self.confidence, Unset):
            confidence = UNSET
        else:
            confidence = self.confidence


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if exposed_value_usd is not UNSET:
            field_dict["exposed_value_usd"] = exposed_value_usd
        if value_source is not UNSET:
            field_dict["value_source"] = value_source
        if expected_value_at_risk_usd is not UNSET:
            field_dict["expected_value_at_risk_usd"] = expected_value_at_risk_usd
        if scenario_closure_loss_usd is not UNSET:
            field_dict["scenario_closure_loss_usd"] = scenario_closure_loss_usd
        if closure_days is not UNSET:
            field_dict["closure_days"] = closure_days
        if daily_loss_rate_usd is not UNSET:
            field_dict["daily_loss_rate_usd"] = daily_loss_rate_usd
        if confidence is not UNSET:
            field_dict["confidence"] = confidence

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        def _parse_exposed_value_usd(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        exposed_value_usd = _parse_exposed_value_usd(d.pop("exposed_value_usd", UNSET))


        def _parse_value_source(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        value_source = _parse_value_source(d.pop("value_source", UNSET))


        def _parse_expected_value_at_risk_usd(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        expected_value_at_risk_usd = _parse_expected_value_at_risk_usd(d.pop("expected_value_at_risk_usd", UNSET))


        def _parse_scenario_closure_loss_usd(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        scenario_closure_loss_usd = _parse_scenario_closure_loss_usd(d.pop("scenario_closure_loss_usd", UNSET))


        def _parse_closure_days(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        closure_days = _parse_closure_days(d.pop("closure_days", UNSET))


        def _parse_daily_loss_rate_usd(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        daily_loss_rate_usd = _parse_daily_loss_rate_usd(d.pop("daily_loss_rate_usd", UNSET))


        def _parse_confidence(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        confidence = _parse_confidence(d.pop("confidence", UNSET))


        analysis_exposed_trade_loss_row = cls(
            exposed_value_usd=exposed_value_usd,
            value_source=value_source,
            expected_value_at_risk_usd=expected_value_at_risk_usd,
            scenario_closure_loss_usd=scenario_closure_loss_usd,
            closure_days=closure_days,
            daily_loss_rate_usd=daily_loss_rate_usd,
            confidence=confidence,
        )


        analysis_exposed_trade_loss_row.additional_properties = d
        return analysis_exposed_trade_loss_row

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
