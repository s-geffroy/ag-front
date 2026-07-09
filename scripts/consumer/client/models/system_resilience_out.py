from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..models.system_resilience_out_regime_type_0 import SystemResilienceOutRegimeType0
from ..models.system_resilience_out_weight_basis_type_0 import SystemResilienceOutWeightBasisType0
from ..types import UNSET, Unset
from dateutil.parser import isoparse
from typing import cast
from typing import cast, Union
from typing import Union
import datetime






T = TypeVar("T", bound="SystemResilienceOut")



@_attrs_define
class SystemResilienceOut:
    """ System resilience via Ecological Network Analysis (Ulanowicz) over the WHOLE systemic relation
    graph (engine `system_resilience`, ADR 0057). This engine emits a single global row (`scope`
    ="GLOBAL"), not a per-strategic-system result. Derived/candidate, never canonical (ADR 0005).
    `regime` is the window-of-vitality classification; `robustness` peaks in the balanced middle.
    `alpha` is the degree of order (0–1); `weight_basis` records whether edge weights came from a
    strength proxy or throughput. All figures are schematic candidates pending human validation.

        Attributes:
            scope (Union[Unset, str]):  Default: 'GLOBAL'.
            total_system_throughput (Union[None, Unset, float]):
            ascendency (Union[None, Unset, float]):
            development_capacity (Union[None, Unset, float]):
            overhead (Union[None, Unset, float]):
            alpha (Union[None, Unset, float]):
            robustness (Union[None, Unset, float]):
            regime (Union[None, SystemResilienceOutRegimeType0, Unset]):
            weight_basis (Union[None, SystemResilienceOutWeightBasisType0, Unset]):
            node_count (Union[None, Unset, int]):
            edge_count (Union[None, Unset, int]):
            engine_version (Union[None, Unset, str]):
            generated_at (Union[None, Unset, datetime.datetime]):
            disclaimer (Union[Unset, str]):  Default: 'Analytical results are derived, candidate outputs (not human-
                validated) and are never written back to canonical without a review gate.'.
     """

    scope: Union[Unset, str] = 'GLOBAL'
    total_system_throughput: Union[None, Unset, float] = UNSET
    ascendency: Union[None, Unset, float] = UNSET
    development_capacity: Union[None, Unset, float] = UNSET
    overhead: Union[None, Unset, float] = UNSET
    alpha: Union[None, Unset, float] = UNSET
    robustness: Union[None, Unset, float] = UNSET
    regime: Union[None, SystemResilienceOutRegimeType0, Unset] = UNSET
    weight_basis: Union[None, SystemResilienceOutWeightBasisType0, Unset] = UNSET
    node_count: Union[None, Unset, int] = UNSET
    edge_count: Union[None, Unset, int] = UNSET
    engine_version: Union[None, Unset, str] = UNSET
    generated_at: Union[None, Unset, datetime.datetime] = UNSET
    disclaimer: Union[Unset, str] = 'Analytical results are derived, candidate outputs (not human-validated) and are never written back to canonical without a review gate.'
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        scope = self.scope

        total_system_throughput: Union[None, Unset, float]
        if isinstance(self.total_system_throughput, Unset):
            total_system_throughput = UNSET
        else:
            total_system_throughput = self.total_system_throughput

        ascendency: Union[None, Unset, float]
        if isinstance(self.ascendency, Unset):
            ascendency = UNSET
        else:
            ascendency = self.ascendency

        development_capacity: Union[None, Unset, float]
        if isinstance(self.development_capacity, Unset):
            development_capacity = UNSET
        else:
            development_capacity = self.development_capacity

        overhead: Union[None, Unset, float]
        if isinstance(self.overhead, Unset):
            overhead = UNSET
        else:
            overhead = self.overhead

        alpha: Union[None, Unset, float]
        if isinstance(self.alpha, Unset):
            alpha = UNSET
        else:
            alpha = self.alpha

        robustness: Union[None, Unset, float]
        if isinstance(self.robustness, Unset):
            robustness = UNSET
        else:
            robustness = self.robustness

        regime: Union[None, Unset, str]
        if isinstance(self.regime, Unset):
            regime = UNSET
        elif isinstance(self.regime, SystemResilienceOutRegimeType0):
            regime = self.regime.value
        else:
            regime = self.regime

        weight_basis: Union[None, Unset, str]
        if isinstance(self.weight_basis, Unset):
            weight_basis = UNSET
        elif isinstance(self.weight_basis, SystemResilienceOutWeightBasisType0):
            weight_basis = self.weight_basis.value
        else:
            weight_basis = self.weight_basis

        node_count: Union[None, Unset, int]
        if isinstance(self.node_count, Unset):
            node_count = UNSET
        else:
            node_count = self.node_count

        edge_count: Union[None, Unset, int]
        if isinstance(self.edge_count, Unset):
            edge_count = UNSET
        else:
            edge_count = self.edge_count

        engine_version: Union[None, Unset, str]
        if isinstance(self.engine_version, Unset):
            engine_version = UNSET
        else:
            engine_version = self.engine_version

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
        })
        if scope is not UNSET:
            field_dict["scope"] = scope
        if total_system_throughput is not UNSET:
            field_dict["total_system_throughput"] = total_system_throughput
        if ascendency is not UNSET:
            field_dict["ascendency"] = ascendency
        if development_capacity is not UNSET:
            field_dict["development_capacity"] = development_capacity
        if overhead is not UNSET:
            field_dict["overhead"] = overhead
        if alpha is not UNSET:
            field_dict["alpha"] = alpha
        if robustness is not UNSET:
            field_dict["robustness"] = robustness
        if regime is not UNSET:
            field_dict["regime"] = regime
        if weight_basis is not UNSET:
            field_dict["weight_basis"] = weight_basis
        if node_count is not UNSET:
            field_dict["node_count"] = node_count
        if edge_count is not UNSET:
            field_dict["edge_count"] = edge_count
        if engine_version is not UNSET:
            field_dict["engine_version"] = engine_version
        if generated_at is not UNSET:
            field_dict["generated_at"] = generated_at
        if disclaimer is not UNSET:
            field_dict["disclaimer"] = disclaimer

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        scope = d.pop("scope", UNSET)

        def _parse_total_system_throughput(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        total_system_throughput = _parse_total_system_throughput(d.pop("total_system_throughput", UNSET))


        def _parse_ascendency(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        ascendency = _parse_ascendency(d.pop("ascendency", UNSET))


        def _parse_development_capacity(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        development_capacity = _parse_development_capacity(d.pop("development_capacity", UNSET))


        def _parse_overhead(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        overhead = _parse_overhead(d.pop("overhead", UNSET))


        def _parse_alpha(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        alpha = _parse_alpha(d.pop("alpha", UNSET))


        def _parse_robustness(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        robustness = _parse_robustness(d.pop("robustness", UNSET))


        def _parse_regime(data: object) -> Union[None, SystemResilienceOutRegimeType0, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                regime_type_0 = SystemResilienceOutRegimeType0(data)



                return regime_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, SystemResilienceOutRegimeType0, Unset], data)

        regime = _parse_regime(d.pop("regime", UNSET))


        def _parse_weight_basis(data: object) -> Union[None, SystemResilienceOutWeightBasisType0, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                weight_basis_type_0 = SystemResilienceOutWeightBasisType0(data)



                return weight_basis_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, SystemResilienceOutWeightBasisType0, Unset], data)

        weight_basis = _parse_weight_basis(d.pop("weight_basis", UNSET))


        def _parse_node_count(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        node_count = _parse_node_count(d.pop("node_count", UNSET))


        def _parse_edge_count(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        edge_count = _parse_edge_count(d.pop("edge_count", UNSET))


        def _parse_engine_version(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        engine_version = _parse_engine_version(d.pop("engine_version", UNSET))


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

        system_resilience_out = cls(
            scope=scope,
            total_system_throughput=total_system_throughput,
            ascendency=ascendency,
            development_capacity=development_capacity,
            overhead=overhead,
            alpha=alpha,
            robustness=robustness,
            regime=regime,
            weight_basis=weight_basis,
            node_count=node_count,
            edge_count=edge_count,
            engine_version=engine_version,
            generated_at=generated_at,
            disclaimer=disclaimer,
        )


        system_resilience_out.additional_properties = d
        return system_resilience_out

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
