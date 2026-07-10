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
  from ..models.metric_out import MetricOut
  from ..models.geometry_out import GeometryOut
  from ..models.risk_out import RiskOut
  from ..models.chokepoint_episode_out import ChokepointEpisodeOut
  from ..models.alternative_out import AlternativeOut
  from ..models.flow_out import FlowOut





T = TypeVar("T", bound="ChokepointDetail")



@_attrs_define
class ChokepointDetail:
    """ 
        Attributes:
            id (str):
            canonical_name (str):
            object_kind (str):
            family (str):
            type_ (str):
            priority_class (str):
            license_taint (bool):
            macro_region (Union[None, Unset, str]):
            required_attributions (Union[Unset, list[str]]):
            max_license_risk (Union[None, Unset, str]):
            flows (Union[Unset, list['FlowOut']]):
            risks (Union[Unset, list['RiskOut']]):
            geometries (Union[Unset, list['GeometryOut']]):
            metrics (Union[Unset, list['MetricOut']]):
            alternatives (Union[Unset, list['AlternativeOut']]):
            episodes (Union[Unset, list['ChokepointEpisodeOut']]):
            source_ids (Union[Unset, list[str]]):
            geometry_disclaimer (Union[Unset, str]):  Default: 'Geometry is schematic and not validated for navigational or
                legal precision.'.
     """

    id: str
    canonical_name: str
    object_kind: str
    family: str
    type_: str
    priority_class: str
    license_taint: bool
    macro_region: Union[None, Unset, str] = UNSET
    required_attributions: Union[Unset, list[str]] = UNSET
    max_license_risk: Union[None, Unset, str] = UNSET
    flows: Union[Unset, list['FlowOut']] = UNSET
    risks: Union[Unset, list['RiskOut']] = UNSET
    geometries: Union[Unset, list['GeometryOut']] = UNSET
    metrics: Union[Unset, list['MetricOut']] = UNSET
    alternatives: Union[Unset, list['AlternativeOut']] = UNSET
    episodes: Union[Unset, list['ChokepointEpisodeOut']] = UNSET
    source_ids: Union[Unset, list[str]] = UNSET
    geometry_disclaimer: Union[Unset, str] = 'Geometry is schematic and not validated for navigational or legal precision.'
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        from ..models.metric_out import MetricOut
        from ..models.geometry_out import GeometryOut
        from ..models.risk_out import RiskOut
        from ..models.chokepoint_episode_out import ChokepointEpisodeOut
        from ..models.alternative_out import AlternativeOut
        from ..models.flow_out import FlowOut
        id = self.id

        canonical_name = self.canonical_name

        object_kind = self.object_kind

        family = self.family

        type_ = self.type_

        priority_class = self.priority_class

        license_taint = self.license_taint

        macro_region: Union[None, Unset, str]
        if isinstance(self.macro_region, Unset):
            macro_region = UNSET
        else:
            macro_region = self.macro_region

        required_attributions: Union[Unset, list[str]] = UNSET
        if not isinstance(self.required_attributions, Unset):
            required_attributions = self.required_attributions



        max_license_risk: Union[None, Unset, str]
        if isinstance(self.max_license_risk, Unset):
            max_license_risk = UNSET
        else:
            max_license_risk = self.max_license_risk

        flows: Union[Unset, list[dict[str, Any]]] = UNSET
        if not isinstance(self.flows, Unset):
            flows = []
            for flows_item_data in self.flows:
                flows_item = flows_item_data.to_dict()
                flows.append(flows_item)



        risks: Union[Unset, list[dict[str, Any]]] = UNSET
        if not isinstance(self.risks, Unset):
            risks = []
            for risks_item_data in self.risks:
                risks_item = risks_item_data.to_dict()
                risks.append(risks_item)



        geometries: Union[Unset, list[dict[str, Any]]] = UNSET
        if not isinstance(self.geometries, Unset):
            geometries = []
            for geometries_item_data in self.geometries:
                geometries_item = geometries_item_data.to_dict()
                geometries.append(geometries_item)



        metrics: Union[Unset, list[dict[str, Any]]] = UNSET
        if not isinstance(self.metrics, Unset):
            metrics = []
            for metrics_item_data in self.metrics:
                metrics_item = metrics_item_data.to_dict()
                metrics.append(metrics_item)



        alternatives: Union[Unset, list[dict[str, Any]]] = UNSET
        if not isinstance(self.alternatives, Unset):
            alternatives = []
            for alternatives_item_data in self.alternatives:
                alternatives_item = alternatives_item_data.to_dict()
                alternatives.append(alternatives_item)



        episodes: Union[Unset, list[dict[str, Any]]] = UNSET
        if not isinstance(self.episodes, Unset):
            episodes = []
            for episodes_item_data in self.episodes:
                episodes_item = episodes_item_data.to_dict()
                episodes.append(episodes_item)



        source_ids: Union[Unset, list[str]] = UNSET
        if not isinstance(self.source_ids, Unset):
            source_ids = self.source_ids



        geometry_disclaimer = self.geometry_disclaimer


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "id": id,
            "canonical_name": canonical_name,
            "object_kind": object_kind,
            "family": family,
            "type": type_,
            "priority_class": priority_class,
            "license_taint": license_taint,
        })
        if macro_region is not UNSET:
            field_dict["macro_region"] = macro_region
        if required_attributions is not UNSET:
            field_dict["required_attributions"] = required_attributions
        if max_license_risk is not UNSET:
            field_dict["max_license_risk"] = max_license_risk
        if flows is not UNSET:
            field_dict["flows"] = flows
        if risks is not UNSET:
            field_dict["risks"] = risks
        if geometries is not UNSET:
            field_dict["geometries"] = geometries
        if metrics is not UNSET:
            field_dict["metrics"] = metrics
        if alternatives is not UNSET:
            field_dict["alternatives"] = alternatives
        if episodes is not UNSET:
            field_dict["episodes"] = episodes
        if source_ids is not UNSET:
            field_dict["source_ids"] = source_ids
        if geometry_disclaimer is not UNSET:
            field_dict["geometry_disclaimer"] = geometry_disclaimer

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.metric_out import MetricOut
        from ..models.geometry_out import GeometryOut
        from ..models.risk_out import RiskOut
        from ..models.chokepoint_episode_out import ChokepointEpisodeOut
        from ..models.alternative_out import AlternativeOut
        from ..models.flow_out import FlowOut
        d = dict(src_dict)
        id = d.pop("id")

        canonical_name = d.pop("canonical_name")

        object_kind = d.pop("object_kind")

        family = d.pop("family")

        type_ = d.pop("type")

        priority_class = d.pop("priority_class")

        license_taint = d.pop("license_taint")

        def _parse_macro_region(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        macro_region = _parse_macro_region(d.pop("macro_region", UNSET))


        required_attributions = cast(list[str], d.pop("required_attributions", UNSET))


        def _parse_max_license_risk(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        max_license_risk = _parse_max_license_risk(d.pop("max_license_risk", UNSET))


        flows = []
        _flows = d.pop("flows", UNSET)
        for flows_item_data in (_flows or []):
            flows_item = FlowOut.from_dict(flows_item_data)



            flows.append(flows_item)


        risks = []
        _risks = d.pop("risks", UNSET)
        for risks_item_data in (_risks or []):
            risks_item = RiskOut.from_dict(risks_item_data)



            risks.append(risks_item)


        geometries = []
        _geometries = d.pop("geometries", UNSET)
        for geometries_item_data in (_geometries or []):
            geometries_item = GeometryOut.from_dict(geometries_item_data)



            geometries.append(geometries_item)


        metrics = []
        _metrics = d.pop("metrics", UNSET)
        for metrics_item_data in (_metrics or []):
            metrics_item = MetricOut.from_dict(metrics_item_data)



            metrics.append(metrics_item)


        alternatives = []
        _alternatives = d.pop("alternatives", UNSET)
        for alternatives_item_data in (_alternatives or []):
            alternatives_item = AlternativeOut.from_dict(alternatives_item_data)



            alternatives.append(alternatives_item)


        episodes = []
        _episodes = d.pop("episodes", UNSET)
        for episodes_item_data in (_episodes or []):
            episodes_item = ChokepointEpisodeOut.from_dict(episodes_item_data)



            episodes.append(episodes_item)


        source_ids = cast(list[str], d.pop("source_ids", UNSET))


        geometry_disclaimer = d.pop("geometry_disclaimer", UNSET)

        chokepoint_detail = cls(
            id=id,
            canonical_name=canonical_name,
            object_kind=object_kind,
            family=family,
            type_=type_,
            priority_class=priority_class,
            license_taint=license_taint,
            macro_region=macro_region,
            required_attributions=required_attributions,
            max_license_risk=max_license_risk,
            flows=flows,
            risks=risks,
            geometries=geometries,
            metrics=metrics,
            alternatives=alternatives,
            episodes=episodes,
            source_ids=source_ids,
            geometry_disclaimer=geometry_disclaimer,
        )


        chokepoint_detail.additional_properties = d
        return chokepoint_detail

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
