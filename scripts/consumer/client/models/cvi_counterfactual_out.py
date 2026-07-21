from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..models.cvi_counterfactual_out_scale import CviCounterfactualOutScale
from ..models.cvi_counterfactual_out_scope import CviCounterfactualOutScope
from ..models.cvi_counterfactual_out_status import CviCounterfactualOutStatus
from ..types import UNSET, Unset
from typing import cast
from typing import Union

if TYPE_CHECKING:
  from ..models.cvi_counterfactual_out_buckets import CviCounterfactualOutBuckets





T = TypeVar("T", bound="CviCounterfactualOut")



@_attrs_define
class CviCounterfactualOut:
    """ The `concentration`-removed level-slide counted over one population (ADR 0070), derived/candidate.

    Additive block requested by ag-front (0012): for the cohort of `scope` objects never examined for
    substitution, `changent` counts those whose binding-constraint `global_level` moves once the
    `removed_dimension` is dropped, and `critique_vers_bas` those that fall from `critique` to `bas`.
    `population` is a LIVE count (it drifts with the base — that drift is the point). `buckets` names the
    four score→level ranges. Every field is required; no key is ever null. Served clearly marked
    candidate (status + verbatim disclaimer); it validates nothing and never mutates canonical.

        Attributes:
            scope (CviCounterfactualOutScope):
            removed_dimension (str):
            population (int):
            changent (int):
            critique_vers_bas (int):
            buckets (CviCounterfactualOutBuckets):
            method_note (str):
            scale (Union[Unset, CviCounterfactualOutScale]):  Default: CviCounterfactualOutScale.VALUE_0.
            status (Union[Unset, CviCounterfactualOutStatus]):  Default: CviCounterfactualOutStatus.CANDIDATE.
            disclaimer (Union[Unset, str]):  Default: 'Analytical results are derived, candidate outputs (not human-
                validated) and are never written back to canonical without a review gate.'.
     """

    scope: CviCounterfactualOutScope
    removed_dimension: str
    population: int
    changent: int
    critique_vers_bas: int
    buckets: 'CviCounterfactualOutBuckets'
    method_note: str
    scale: Union[Unset, CviCounterfactualOutScale] = CviCounterfactualOutScale.VALUE_0
    status: Union[Unset, CviCounterfactualOutStatus] = CviCounterfactualOutStatus.CANDIDATE
    disclaimer: Union[Unset, str] = 'Analytical results are derived, candidate outputs (not human-validated) and are never written back to canonical without a review gate.'
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        from ..models.cvi_counterfactual_out_buckets import CviCounterfactualOutBuckets
        scope = self.scope.value

        removed_dimension = self.removed_dimension

        population = self.population

        changent = self.changent

        critique_vers_bas = self.critique_vers_bas

        buckets = self.buckets.to_dict()

        method_note = self.method_note

        scale: Union[Unset, str] = UNSET
        if not isinstance(self.scale, Unset):
            scale = self.scale.value


        status: Union[Unset, str] = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value


        disclaimer = self.disclaimer


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "scope": scope,
            "removed_dimension": removed_dimension,
            "population": population,
            "changent": changent,
            "critique_vers_bas": critique_vers_bas,
            "buckets": buckets,
            "method_note": method_note,
        })
        if scale is not UNSET:
            field_dict["scale"] = scale
        if status is not UNSET:
            field_dict["status"] = status
        if disclaimer is not UNSET:
            field_dict["disclaimer"] = disclaimer

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.cvi_counterfactual_out_buckets import CviCounterfactualOutBuckets
        d = dict(src_dict)
        scope = CviCounterfactualOutScope(d.pop("scope"))




        removed_dimension = d.pop("removed_dimension")

        population = d.pop("population")

        changent = d.pop("changent")

        critique_vers_bas = d.pop("critique_vers_bas")

        buckets = CviCounterfactualOutBuckets.from_dict(d.pop("buckets"))




        method_note = d.pop("method_note")

        _scale = d.pop("scale", UNSET)
        scale: Union[Unset, CviCounterfactualOutScale]
        if isinstance(_scale,  Unset):
            scale = UNSET
        else:
            scale = CviCounterfactualOutScale(_scale)




        _status = d.pop("status", UNSET)
        status: Union[Unset, CviCounterfactualOutStatus]
        if isinstance(_status,  Unset):
            status = UNSET
        else:
            status = CviCounterfactualOutStatus(_status)




        disclaimer = d.pop("disclaimer", UNSET)

        cvi_counterfactual_out = cls(
            scope=scope,
            removed_dimension=removed_dimension,
            population=population,
            changent=changent,
            critique_vers_bas=critique_vers_bas,
            buckets=buckets,
            method_note=method_note,
            scale=scale,
            status=status,
            disclaimer=disclaimer,
        )


        cvi_counterfactual_out.additional_properties = d
        return cvi_counterfactual_out

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
