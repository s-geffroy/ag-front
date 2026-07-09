from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..models.cvi_assessment_global_level_type_0 import CviAssessmentGlobalLevelType0
from ..models.cvi_assessment_scale import CviAssessmentScale
from ..models.cvi_assessment_status import CviAssessmentStatus
from ..types import UNSET, Unset
from dateutil.parser import isoparse
from typing import cast
from typing import cast, Union
from typing import Union
import datetime

if TYPE_CHECKING:
  from ..models.cvi_assessment_dimensions import CviAssessmentDimensions





T = TypeVar("T", bound="CviAssessment")



@_attrs_define
class CviAssessment:
    """ Corridor Vulnerability Index assessment for one chokepoint (ADR 0055), derived/candidate.

    The 8 `dimensions` keys are EXACTLY: exposition, concentration, menace, capacite_perturbation,
    resilience, cout_contournement, gouvernance, incertitude. A dimension with no real engine input is
    OMITTED, never fabricated (prompt §garde-fous 2). `aggregate_score` (0–100) is INTENTIONALLY ABSENT:
    it is gated on `methodology_documented` (always False here), so it is never served (hard gate, ADR
    0049). `global_level` is a per-corridor qualitative summary (binding constraint), not a cross-corridor
    ranking. `status` flags the validation tier: candidate output is served clearly marked as not
    human-validated (disclaimer verbatim).

        Attributes:
            chokepoint_id (str):
            dimensions (CviAssessmentDimensions):
            scale (Union[Unset, CviAssessmentScale]):  Default: CviAssessmentScale.VALUE_1.
            global_level (Union[CviAssessmentGlobalLevelType0, None, Unset]):
            methodology_documented (Union[Unset, bool]):  Default: False.
            sources (Union[Unset, list[str]]):
            uncertainties (Union[Unset, list[str]]):
            last_updated (Union[None, Unset, datetime.datetime]):
            engine_version (Union[None, Unset, str]):
            status (Union[Unset, CviAssessmentStatus]):  Default: CviAssessmentStatus.CANDIDATE.
            disclaimer (Union[Unset, str]):  Default: 'Analytical results are derived, candidate outputs (not human-
                validated) and are never written back to canonical without a review gate.'.
     """

    chokepoint_id: str
    dimensions: 'CviAssessmentDimensions'
    scale: Union[Unset, CviAssessmentScale] = CviAssessmentScale.VALUE_1
    global_level: Union[CviAssessmentGlobalLevelType0, None, Unset] = UNSET
    methodology_documented: Union[Unset, bool] = False
    sources: Union[Unset, list[str]] = UNSET
    uncertainties: Union[Unset, list[str]] = UNSET
    last_updated: Union[None, Unset, datetime.datetime] = UNSET
    engine_version: Union[None, Unset, str] = UNSET
    status: Union[Unset, CviAssessmentStatus] = CviAssessmentStatus.CANDIDATE
    disclaimer: Union[Unset, str] = 'Analytical results are derived, candidate outputs (not human-validated) and are never written back to canonical without a review gate.'
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        from ..models.cvi_assessment_dimensions import CviAssessmentDimensions
        chokepoint_id = self.chokepoint_id

        dimensions = self.dimensions.to_dict()

        scale: Union[Unset, str] = UNSET
        if not isinstance(self.scale, Unset):
            scale = self.scale.value


        global_level: Union[None, Unset, str]
        if isinstance(self.global_level, Unset):
            global_level = UNSET
        elif isinstance(self.global_level, CviAssessmentGlobalLevelType0):
            global_level = self.global_level.value
        else:
            global_level = self.global_level

        methodology_documented = self.methodology_documented

        sources: Union[Unset, list[str]] = UNSET
        if not isinstance(self.sources, Unset):
            sources = self.sources



        uncertainties: Union[Unset, list[str]] = UNSET
        if not isinstance(self.uncertainties, Unset):
            uncertainties = self.uncertainties



        last_updated: Union[None, Unset, str]
        if isinstance(self.last_updated, Unset):
            last_updated = UNSET
        elif isinstance(self.last_updated, datetime.datetime):
            last_updated = self.last_updated.isoformat()
        else:
            last_updated = self.last_updated

        engine_version: Union[None, Unset, str]
        if isinstance(self.engine_version, Unset):
            engine_version = UNSET
        else:
            engine_version = self.engine_version

        status: Union[Unset, str] = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value


        disclaimer = self.disclaimer


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "chokepoint_id": chokepoint_id,
            "dimensions": dimensions,
        })
        if scale is not UNSET:
            field_dict["scale"] = scale
        if global_level is not UNSET:
            field_dict["global_level"] = global_level
        if methodology_documented is not UNSET:
            field_dict["methodology_documented"] = methodology_documented
        if sources is not UNSET:
            field_dict["sources"] = sources
        if uncertainties is not UNSET:
            field_dict["uncertainties"] = uncertainties
        if last_updated is not UNSET:
            field_dict["last_updated"] = last_updated
        if engine_version is not UNSET:
            field_dict["engine_version"] = engine_version
        if status is not UNSET:
            field_dict["status"] = status
        if disclaimer is not UNSET:
            field_dict["disclaimer"] = disclaimer

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.cvi_assessment_dimensions import CviAssessmentDimensions
        d = dict(src_dict)
        chokepoint_id = d.pop("chokepoint_id")

        dimensions = CviAssessmentDimensions.from_dict(d.pop("dimensions"))




        _scale = d.pop("scale", UNSET)
        scale: Union[Unset, CviAssessmentScale]
        if isinstance(_scale,  Unset):
            scale = UNSET
        else:
            scale = CviAssessmentScale(_scale)




        def _parse_global_level(data: object) -> Union[CviAssessmentGlobalLevelType0, None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                global_level_type_0 = CviAssessmentGlobalLevelType0(data)



                return global_level_type_0
            except: # noqa: E722
                pass
            return cast(Union[CviAssessmentGlobalLevelType0, None, Unset], data)

        global_level = _parse_global_level(d.pop("global_level", UNSET))


        methodology_documented = d.pop("methodology_documented", UNSET)

        sources = cast(list[str], d.pop("sources", UNSET))


        uncertainties = cast(list[str], d.pop("uncertainties", UNSET))


        def _parse_last_updated(data: object) -> Union[None, Unset, datetime.datetime]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                last_updated_type_0 = isoparse(data)



                return last_updated_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, Unset, datetime.datetime], data)

        last_updated = _parse_last_updated(d.pop("last_updated", UNSET))


        def _parse_engine_version(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        engine_version = _parse_engine_version(d.pop("engine_version", UNSET))


        _status = d.pop("status", UNSET)
        status: Union[Unset, CviAssessmentStatus]
        if isinstance(_status,  Unset):
            status = UNSET
        else:
            status = CviAssessmentStatus(_status)




        disclaimer = d.pop("disclaimer", UNSET)

        cvi_assessment = cls(
            chokepoint_id=chokepoint_id,
            dimensions=dimensions,
            scale=scale,
            global_level=global_level,
            methodology_documented=methodology_documented,
            sources=sources,
            uncertainties=uncertainties,
            last_updated=last_updated,
            engine_version=engine_version,
            status=status,
            disclaimer=disclaimer,
        )


        cvi_assessment.additional_properties = d
        return cvi_assessment

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
