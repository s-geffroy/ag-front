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






T = TypeVar("T", bound="AnalysisRegimeAssessmentRow")



@_attrs_define
class AnalysisRegimeAssessmentRow:
    """ One `regime_assessment` row (`analytics.regime_assessment_result`).

        Attributes:
            operational_state (Union[None, Unset, str]):
            lifecycle_phase (Union[None, Unset, str]):
            pressure_score (Union[None, Unset, float]):
            contributing_signals (Union[None, Unset, int]):
            vetoes_applied (Union[Any, None, Unset]):
            observed_window_end (Union[None, Unset, datetime.datetime]):
     """

    operational_state: Union[None, Unset, str] = UNSET
    lifecycle_phase: Union[None, Unset, str] = UNSET
    pressure_score: Union[None, Unset, float] = UNSET
    contributing_signals: Union[None, Unset, int] = UNSET
    vetoes_applied: Union[Any, None, Unset] = UNSET
    observed_window_end: Union[None, Unset, datetime.datetime] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        operational_state: Union[None, Unset, str]
        if isinstance(self.operational_state, Unset):
            operational_state = UNSET
        else:
            operational_state = self.operational_state

        lifecycle_phase: Union[None, Unset, str]
        if isinstance(self.lifecycle_phase, Unset):
            lifecycle_phase = UNSET
        else:
            lifecycle_phase = self.lifecycle_phase

        pressure_score: Union[None, Unset, float]
        if isinstance(self.pressure_score, Unset):
            pressure_score = UNSET
        else:
            pressure_score = self.pressure_score

        contributing_signals: Union[None, Unset, int]
        if isinstance(self.contributing_signals, Unset):
            contributing_signals = UNSET
        else:
            contributing_signals = self.contributing_signals

        vetoes_applied: Union[Any, None, Unset]
        if isinstance(self.vetoes_applied, Unset):
            vetoes_applied = UNSET
        else:
            vetoes_applied = self.vetoes_applied

        observed_window_end: Union[None, Unset, str]
        if isinstance(self.observed_window_end, Unset):
            observed_window_end = UNSET
        elif isinstance(self.observed_window_end, datetime.datetime):
            observed_window_end = self.observed_window_end.isoformat()
        else:
            observed_window_end = self.observed_window_end


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if operational_state is not UNSET:
            field_dict["operational_state"] = operational_state
        if lifecycle_phase is not UNSET:
            field_dict["lifecycle_phase"] = lifecycle_phase
        if pressure_score is not UNSET:
            field_dict["pressure_score"] = pressure_score
        if contributing_signals is not UNSET:
            field_dict["contributing_signals"] = contributing_signals
        if vetoes_applied is not UNSET:
            field_dict["vetoes_applied"] = vetoes_applied
        if observed_window_end is not UNSET:
            field_dict["observed_window_end"] = observed_window_end

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        def _parse_operational_state(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        operational_state = _parse_operational_state(d.pop("operational_state", UNSET))


        def _parse_lifecycle_phase(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        lifecycle_phase = _parse_lifecycle_phase(d.pop("lifecycle_phase", UNSET))


        def _parse_pressure_score(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        pressure_score = _parse_pressure_score(d.pop("pressure_score", UNSET))


        def _parse_contributing_signals(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        contributing_signals = _parse_contributing_signals(d.pop("contributing_signals", UNSET))


        def _parse_vetoes_applied(data: object) -> Union[Any, None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[Any, None, Unset], data)

        vetoes_applied = _parse_vetoes_applied(d.pop("vetoes_applied", UNSET))


        def _parse_observed_window_end(data: object) -> Union[None, Unset, datetime.datetime]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                observed_window_end_type_0 = isoparse(data)



                return observed_window_end_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, Unset, datetime.datetime], data)

        observed_window_end = _parse_observed_window_end(d.pop("observed_window_end", UNSET))


        analysis_regime_assessment_row = cls(
            operational_state=operational_state,
            lifecycle_phase=lifecycle_phase,
            pressure_score=pressure_score,
            contributing_signals=contributing_signals,
            vetoes_applied=vetoes_applied,
            observed_window_end=observed_window_end,
        )


        analysis_regime_assessment_row.additional_properties = d
        return analysis_regime_assessment_row

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
