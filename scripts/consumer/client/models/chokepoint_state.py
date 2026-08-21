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
  from ..models.chokepoint_state_components import ChokepointStateComponents
  from ..models.state_coverage import StateCoverage





T = TypeVar("T", bound="ChokepointState")



@_attrs_define
class ChokepointState:
    """ Current state of one chokepoint: what is observed, what is not, and how old each part is.

    The three percentages are served TOGETHER and are meaningless apart. Read `coverage_pct` first:
    `tension_pct` is computed over the components that HAVE data — an absent component leaves the
    denominator rather than counting as zero, so a hole never reads as calm.

    NOT comparable between objects, by construction: two objects rest on different available
    components. A percentage here describes one object over time. (Same warning as `pressure_score`;
    ADR 0049 — no cross-object ranking.) `tension_pct` is null when no component carries a level.

        Attributes:
            chokepoint_id (str):
            canonical_name (str):
            components (ChokepointStateComponents):
            coverage_pct (float):
            coverage (StateCoverage): How many components actually stand behind the figures. A high tension over one
                component is not
                the same claim as the same tension over five.
            comparability (str):
            priority_class (Union[None, Unset, str]):
            tension_pct (Union[None, Unset, float]):
            confidence_pct (Union[None, Unset, float]):
     """

    chokepoint_id: str
    canonical_name: str
    components: 'ChokepointStateComponents'
    coverage_pct: float
    coverage: 'StateCoverage'
    comparability: str
    priority_class: Union[None, Unset, str] = UNSET
    tension_pct: Union[None, Unset, float] = UNSET
    confidence_pct: Union[None, Unset, float] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        from ..models.chokepoint_state_components import ChokepointStateComponents
        from ..models.state_coverage import StateCoverage
        chokepoint_id = self.chokepoint_id

        canonical_name = self.canonical_name

        components = self.components.to_dict()

        coverage_pct = self.coverage_pct

        coverage = self.coverage.to_dict()

        comparability = self.comparability

        priority_class: Union[None, Unset, str]
        if isinstance(self.priority_class, Unset):
            priority_class = UNSET
        else:
            priority_class = self.priority_class

        tension_pct: Union[None, Unset, float]
        if isinstance(self.tension_pct, Unset):
            tension_pct = UNSET
        else:
            tension_pct = self.tension_pct

        confidence_pct: Union[None, Unset, float]
        if isinstance(self.confidence_pct, Unset):
            confidence_pct = UNSET
        else:
            confidence_pct = self.confidence_pct


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "chokepoint_id": chokepoint_id,
            "canonical_name": canonical_name,
            "components": components,
            "coverage_pct": coverage_pct,
            "coverage": coverage,
            "comparability": comparability,
        })
        if priority_class is not UNSET:
            field_dict["priority_class"] = priority_class
        if tension_pct is not UNSET:
            field_dict["tension_pct"] = tension_pct
        if confidence_pct is not UNSET:
            field_dict["confidence_pct"] = confidence_pct

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.chokepoint_state_components import ChokepointStateComponents
        from ..models.state_coverage import StateCoverage
        d = dict(src_dict)
        chokepoint_id = d.pop("chokepoint_id")

        canonical_name = d.pop("canonical_name")

        components = ChokepointStateComponents.from_dict(d.pop("components"))




        coverage_pct = d.pop("coverage_pct")

        coverage = StateCoverage.from_dict(d.pop("coverage"))




        comparability = d.pop("comparability")

        def _parse_priority_class(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        priority_class = _parse_priority_class(d.pop("priority_class", UNSET))


        def _parse_tension_pct(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        tension_pct = _parse_tension_pct(d.pop("tension_pct", UNSET))


        def _parse_confidence_pct(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        confidence_pct = _parse_confidence_pct(d.pop("confidence_pct", UNSET))


        chokepoint_state = cls(
            chokepoint_id=chokepoint_id,
            canonical_name=canonical_name,
            components=components,
            coverage_pct=coverage_pct,
            coverage=coverage,
            comparability=comparability,
            priority_class=priority_class,
            tension_pct=tension_pct,
            confidence_pct=confidence_pct,
        )


        chokepoint_state.additional_properties = d
        return chokepoint_state

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
