from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..models.state_component_status import StateComponentStatus
from ..types import UNSET, Unset
from dateutil.parser import isoparse
from typing import cast
from typing import cast, Union
from typing import Union
import datetime






T = TypeVar("T", bound="StateComponent")



@_attrs_define
class StateComponent:
    """ One observable of a chokepoint's current state, with its own status and age.

    `status` is `observed`, `stale` or `no_data` — never a default value standing in for missing data.
    `tension` is this component's 0-100 contribution when it has one; `None` means the component does
    not feed the tension figure (event_pressure, news) or has nothing to say. Only the fields that
    apply to a given component are populated.

        Attributes:
            status (StateComponentStatus):
            tension (Union[None, Unset, float]):
            confidence (Union[None, Unset, float]):
            generated_at (Union[None, Unset, datetime.datetime]):
            engine_last_emitted_at (Union[None, Unset, datetime.datetime]):
            observed_window_end (Union[None, Unset, datetime.datetime]):
            operational_state (Union[None, Unset, str]):
            lifecycle_phase (Union[None, Unset, str]):
            contributing_signals (Union[None, Unset, int]):
            pressure_score (Union[None, Unset, float]):
            signal_count (Union[None, Unset, int]):
            top_domain (Union[None, Unset, str]):
            global_level (Union[None, Unset, str]):
            binding_dimension (Union[None, Unset, str]):
            dimensions_evaluated (Union[None, Unset, int]):
            dimensions_total (Union[None, Unset, int]):
            signal_family (Union[None, Unset, str]):
            market_count (Union[None, Unset, int]):
            consensus_probability (Union[None, Unset, float]):
            level (Union[None, Unset, str]):
            trigger_summary (Union[None, Unset, str]):
            review_status (Union[None, Unset, str]):
            cluster_count (Union[None, Unset, int]):
            run_id (Union[None, Unset, str]):
            last_seen (Union[None, Unset, datetime.date]):
     """

    status: StateComponentStatus
    tension: Union[None, Unset, float] = UNSET
    confidence: Union[None, Unset, float] = UNSET
    generated_at: Union[None, Unset, datetime.datetime] = UNSET
    engine_last_emitted_at: Union[None, Unset, datetime.datetime] = UNSET
    observed_window_end: Union[None, Unset, datetime.datetime] = UNSET
    operational_state: Union[None, Unset, str] = UNSET
    lifecycle_phase: Union[None, Unset, str] = UNSET
    contributing_signals: Union[None, Unset, int] = UNSET
    pressure_score: Union[None, Unset, float] = UNSET
    signal_count: Union[None, Unset, int] = UNSET
    top_domain: Union[None, Unset, str] = UNSET
    global_level: Union[None, Unset, str] = UNSET
    binding_dimension: Union[None, Unset, str] = UNSET
    dimensions_evaluated: Union[None, Unset, int] = UNSET
    dimensions_total: Union[None, Unset, int] = UNSET
    signal_family: Union[None, Unset, str] = UNSET
    market_count: Union[None, Unset, int] = UNSET
    consensus_probability: Union[None, Unset, float] = UNSET
    level: Union[None, Unset, str] = UNSET
    trigger_summary: Union[None, Unset, str] = UNSET
    review_status: Union[None, Unset, str] = UNSET
    cluster_count: Union[None, Unset, int] = UNSET
    run_id: Union[None, Unset, str] = UNSET
    last_seen: Union[None, Unset, datetime.date] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        status = self.status.value

        tension: Union[None, Unset, float]
        if isinstance(self.tension, Unset):
            tension = UNSET
        else:
            tension = self.tension

        confidence: Union[None, Unset, float]
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

        engine_last_emitted_at: Union[None, Unset, str]
        if isinstance(self.engine_last_emitted_at, Unset):
            engine_last_emitted_at = UNSET
        elif isinstance(self.engine_last_emitted_at, datetime.datetime):
            engine_last_emitted_at = self.engine_last_emitted_at.isoformat()
        else:
            engine_last_emitted_at = self.engine_last_emitted_at

        observed_window_end: Union[None, Unset, str]
        if isinstance(self.observed_window_end, Unset):
            observed_window_end = UNSET
        elif isinstance(self.observed_window_end, datetime.datetime):
            observed_window_end = self.observed_window_end.isoformat()
        else:
            observed_window_end = self.observed_window_end

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

        contributing_signals: Union[None, Unset, int]
        if isinstance(self.contributing_signals, Unset):
            contributing_signals = UNSET
        else:
            contributing_signals = self.contributing_signals

        pressure_score: Union[None, Unset, float]
        if isinstance(self.pressure_score, Unset):
            pressure_score = UNSET
        else:
            pressure_score = self.pressure_score

        signal_count: Union[None, Unset, int]
        if isinstance(self.signal_count, Unset):
            signal_count = UNSET
        else:
            signal_count = self.signal_count

        top_domain: Union[None, Unset, str]
        if isinstance(self.top_domain, Unset):
            top_domain = UNSET
        else:
            top_domain = self.top_domain

        global_level: Union[None, Unset, str]
        if isinstance(self.global_level, Unset):
            global_level = UNSET
        else:
            global_level = self.global_level

        binding_dimension: Union[None, Unset, str]
        if isinstance(self.binding_dimension, Unset):
            binding_dimension = UNSET
        else:
            binding_dimension = self.binding_dimension

        dimensions_evaluated: Union[None, Unset, int]
        if isinstance(self.dimensions_evaluated, Unset):
            dimensions_evaluated = UNSET
        else:
            dimensions_evaluated = self.dimensions_evaluated

        dimensions_total: Union[None, Unset, int]
        if isinstance(self.dimensions_total, Unset):
            dimensions_total = UNSET
        else:
            dimensions_total = self.dimensions_total

        signal_family: Union[None, Unset, str]
        if isinstance(self.signal_family, Unset):
            signal_family = UNSET
        else:
            signal_family = self.signal_family

        market_count: Union[None, Unset, int]
        if isinstance(self.market_count, Unset):
            market_count = UNSET
        else:
            market_count = self.market_count

        consensus_probability: Union[None, Unset, float]
        if isinstance(self.consensus_probability, Unset):
            consensus_probability = UNSET
        else:
            consensus_probability = self.consensus_probability

        level: Union[None, Unset, str]
        if isinstance(self.level, Unset):
            level = UNSET
        else:
            level = self.level

        trigger_summary: Union[None, Unset, str]
        if isinstance(self.trigger_summary, Unset):
            trigger_summary = UNSET
        else:
            trigger_summary = self.trigger_summary

        review_status: Union[None, Unset, str]
        if isinstance(self.review_status, Unset):
            review_status = UNSET
        else:
            review_status = self.review_status

        cluster_count: Union[None, Unset, int]
        if isinstance(self.cluster_count, Unset):
            cluster_count = UNSET
        else:
            cluster_count = self.cluster_count

        run_id: Union[None, Unset, str]
        if isinstance(self.run_id, Unset):
            run_id = UNSET
        else:
            run_id = self.run_id

        last_seen: Union[None, Unset, str]
        if isinstance(self.last_seen, Unset):
            last_seen = UNSET
        elif isinstance(self.last_seen, datetime.date):
            last_seen = self.last_seen.isoformat()
        else:
            last_seen = self.last_seen


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "status": status,
        })
        if tension is not UNSET:
            field_dict["tension"] = tension
        if confidence is not UNSET:
            field_dict["confidence"] = confidence
        if generated_at is not UNSET:
            field_dict["generated_at"] = generated_at
        if engine_last_emitted_at is not UNSET:
            field_dict["engine_last_emitted_at"] = engine_last_emitted_at
        if observed_window_end is not UNSET:
            field_dict["observed_window_end"] = observed_window_end
        if operational_state is not UNSET:
            field_dict["operational_state"] = operational_state
        if lifecycle_phase is not UNSET:
            field_dict["lifecycle_phase"] = lifecycle_phase
        if contributing_signals is not UNSET:
            field_dict["contributing_signals"] = contributing_signals
        if pressure_score is not UNSET:
            field_dict["pressure_score"] = pressure_score
        if signal_count is not UNSET:
            field_dict["signal_count"] = signal_count
        if top_domain is not UNSET:
            field_dict["top_domain"] = top_domain
        if global_level is not UNSET:
            field_dict["global_level"] = global_level
        if binding_dimension is not UNSET:
            field_dict["binding_dimension"] = binding_dimension
        if dimensions_evaluated is not UNSET:
            field_dict["dimensions_evaluated"] = dimensions_evaluated
        if dimensions_total is not UNSET:
            field_dict["dimensions_total"] = dimensions_total
        if signal_family is not UNSET:
            field_dict["signal_family"] = signal_family
        if market_count is not UNSET:
            field_dict["market_count"] = market_count
        if consensus_probability is not UNSET:
            field_dict["consensus_probability"] = consensus_probability
        if level is not UNSET:
            field_dict["level"] = level
        if trigger_summary is not UNSET:
            field_dict["trigger_summary"] = trigger_summary
        if review_status is not UNSET:
            field_dict["review_status"] = review_status
        if cluster_count is not UNSET:
            field_dict["cluster_count"] = cluster_count
        if run_id is not UNSET:
            field_dict["run_id"] = run_id
        if last_seen is not UNSET:
            field_dict["last_seen"] = last_seen

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        status = StateComponentStatus(d.pop("status"))




        def _parse_tension(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        tension = _parse_tension(d.pop("tension", UNSET))


        def _parse_confidence(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

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


        def _parse_engine_last_emitted_at(data: object) -> Union[None, Unset, datetime.datetime]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                engine_last_emitted_at_type_0 = isoparse(data)



                return engine_last_emitted_at_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, Unset, datetime.datetime], data)

        engine_last_emitted_at = _parse_engine_last_emitted_at(d.pop("engine_last_emitted_at", UNSET))


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


        def _parse_contributing_signals(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        contributing_signals = _parse_contributing_signals(d.pop("contributing_signals", UNSET))


        def _parse_pressure_score(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        pressure_score = _parse_pressure_score(d.pop("pressure_score", UNSET))


        def _parse_signal_count(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        signal_count = _parse_signal_count(d.pop("signal_count", UNSET))


        def _parse_top_domain(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        top_domain = _parse_top_domain(d.pop("top_domain", UNSET))


        def _parse_global_level(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        global_level = _parse_global_level(d.pop("global_level", UNSET))


        def _parse_binding_dimension(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        binding_dimension = _parse_binding_dimension(d.pop("binding_dimension", UNSET))


        def _parse_dimensions_evaluated(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        dimensions_evaluated = _parse_dimensions_evaluated(d.pop("dimensions_evaluated", UNSET))


        def _parse_dimensions_total(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        dimensions_total = _parse_dimensions_total(d.pop("dimensions_total", UNSET))


        def _parse_signal_family(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        signal_family = _parse_signal_family(d.pop("signal_family", UNSET))


        def _parse_market_count(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        market_count = _parse_market_count(d.pop("market_count", UNSET))


        def _parse_consensus_probability(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        consensus_probability = _parse_consensus_probability(d.pop("consensus_probability", UNSET))


        def _parse_level(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        level = _parse_level(d.pop("level", UNSET))


        def _parse_trigger_summary(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        trigger_summary = _parse_trigger_summary(d.pop("trigger_summary", UNSET))


        def _parse_review_status(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        review_status = _parse_review_status(d.pop("review_status", UNSET))


        def _parse_cluster_count(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        cluster_count = _parse_cluster_count(d.pop("cluster_count", UNSET))


        def _parse_run_id(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        run_id = _parse_run_id(d.pop("run_id", UNSET))


        def _parse_last_seen(data: object) -> Union[None, Unset, datetime.date]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                last_seen_type_0 = isoparse(data).date()



                return last_seen_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, Unset, datetime.date], data)

        last_seen = _parse_last_seen(d.pop("last_seen", UNSET))


        state_component = cls(
            status=status,
            tension=tension,
            confidence=confidence,
            generated_at=generated_at,
            engine_last_emitted_at=engine_last_emitted_at,
            observed_window_end=observed_window_end,
            operational_state=operational_state,
            lifecycle_phase=lifecycle_phase,
            contributing_signals=contributing_signals,
            pressure_score=pressure_score,
            signal_count=signal_count,
            top_domain=top_domain,
            global_level=global_level,
            binding_dimension=binding_dimension,
            dimensions_evaluated=dimensions_evaluated,
            dimensions_total=dimensions_total,
            signal_family=signal_family,
            market_count=market_count,
            consensus_probability=consensus_probability,
            level=level,
            trigger_summary=trigger_summary,
            review_status=review_status,
            cluster_count=cluster_count,
            run_id=run_id,
            last_seen=last_seen,
        )


        state_component.additional_properties = d
        return state_component

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
