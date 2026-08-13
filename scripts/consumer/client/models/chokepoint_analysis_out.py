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
  from ..models.analysis_criticality_score_block import AnalysisCriticalityScoreBlock
  from ..models.analysis_weaponizability_block import AnalysisWeaponizabilityBlock
  from ..models.analysis_network_centrality_block import AnalysisNetworkCentralityBlock
  from ..models.analysis_relation_out import AnalysisRelationOut
  from ..models.analysis_claim_out import AnalysisClaimOut
  from ..models.analysis_flow_exposure_block import AnalysisFlowExposureBlock
  from ..models.analysis_event_pressure_block import AnalysisEventPressureBlock
  from ..models.analysis_evidence_quality_block import AnalysisEvidenceQualityBlock
  from ..models.analysis_prediction_consensus_block import AnalysisPredictionConsensusBlock
  from ..models.analysis_control_concentration_block import AnalysisControlConcentrationBlock
  from ..models.analysis_system_cascade_block import AnalysisSystemCascadeBlock
  from ..models.analysis_substitution_score_block import AnalysisSubstitutionScoreBlock
  from ..models.analysis_exposed_trade_loss_block import AnalysisExposedTradeLossBlock
  from ..models.analysis_regime_assessment_block import AnalysisRegimeAssessmentBlock
  from ..models.analysis_corroboration_block import AnalysisCorroborationBlock
  from ..models.analysis_flow_value_block import AnalysisFlowValueBlock
  from ..models.analysis_risk_state_block import AnalysisRiskStateBlock





T = TypeVar("T", bound="ChokepointAnalysisOut")



@_attrs_define
class ChokepointAnalysisOut:
    """ Every chokepoint-scoped engine's latest typed output, plus relation edges and evidence claims.

    Typed since 1.6.0 (ADR 0104). The one engine NOT here is the global-graph `system_resilience`,
    served at `GET /analytics/system-resilience`.

        Attributes:
            chokepoint_id (str):
            disclaimer (Union[Unset, str]):  Default: 'Analytical results are derived, candidate outputs (not human-
                validated) and are never written back to canonical without a review gate.'.
            engines (Union[Unset, list[Union['AnalysisControlConcentrationBlock', 'AnalysisCorroborationBlock',
                'AnalysisCriticalityScoreBlock', 'AnalysisEventPressureBlock', 'AnalysisEvidenceQualityBlock',
                'AnalysisExposedTradeLossBlock', 'AnalysisFlowExposureBlock', 'AnalysisFlowValueBlock',
                'AnalysisNetworkCentralityBlock', 'AnalysisPredictionConsensusBlock', 'AnalysisRegimeAssessmentBlock',
                'AnalysisRiskStateBlock', 'AnalysisSubstitutionScoreBlock', 'AnalysisSystemCascadeBlock',
                'AnalysisWeaponizabilityBlock']]]):
            relations (Union[Unset, list['AnalysisRelationOut']]):
            claims (Union[Unset, list['AnalysisClaimOut']]):
     """

    chokepoint_id: str
    disclaimer: Union[Unset, str] = 'Analytical results are derived, candidate outputs (not human-validated) and are never written back to canonical without a review gate.'
    engines: Union[Unset, list[Union['AnalysisControlConcentrationBlock', 'AnalysisCorroborationBlock', 'AnalysisCriticalityScoreBlock', 'AnalysisEventPressureBlock', 'AnalysisEvidenceQualityBlock', 'AnalysisExposedTradeLossBlock', 'AnalysisFlowExposureBlock', 'AnalysisFlowValueBlock', 'AnalysisNetworkCentralityBlock', 'AnalysisPredictionConsensusBlock', 'AnalysisRegimeAssessmentBlock', 'AnalysisRiskStateBlock', 'AnalysisSubstitutionScoreBlock', 'AnalysisSystemCascadeBlock', 'AnalysisWeaponizabilityBlock']]] = UNSET
    relations: Union[Unset, list['AnalysisRelationOut']] = UNSET
    claims: Union[Unset, list['AnalysisClaimOut']] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        from ..models.analysis_criticality_score_block import AnalysisCriticalityScoreBlock
        from ..models.analysis_weaponizability_block import AnalysisWeaponizabilityBlock
        from ..models.analysis_network_centrality_block import AnalysisNetworkCentralityBlock
        from ..models.analysis_relation_out import AnalysisRelationOut
        from ..models.analysis_claim_out import AnalysisClaimOut
        from ..models.analysis_flow_exposure_block import AnalysisFlowExposureBlock
        from ..models.analysis_event_pressure_block import AnalysisEventPressureBlock
        from ..models.analysis_evidence_quality_block import AnalysisEvidenceQualityBlock
        from ..models.analysis_prediction_consensus_block import AnalysisPredictionConsensusBlock
        from ..models.analysis_control_concentration_block import AnalysisControlConcentrationBlock
        from ..models.analysis_system_cascade_block import AnalysisSystemCascadeBlock
        from ..models.analysis_substitution_score_block import AnalysisSubstitutionScoreBlock
        from ..models.analysis_exposed_trade_loss_block import AnalysisExposedTradeLossBlock
        from ..models.analysis_regime_assessment_block import AnalysisRegimeAssessmentBlock
        from ..models.analysis_corroboration_block import AnalysisCorroborationBlock
        from ..models.analysis_flow_value_block import AnalysisFlowValueBlock
        from ..models.analysis_risk_state_block import AnalysisRiskStateBlock
        chokepoint_id = self.chokepoint_id

        disclaimer = self.disclaimer

        engines: Union[Unset, list[dict[str, Any]]] = UNSET
        if not isinstance(self.engines, Unset):
            engines = []
            for engines_item_data in self.engines:
                engines_item: dict[str, Any]
                if isinstance(engines_item_data, AnalysisEvidenceQualityBlock):
                    engines_item = engines_item_data.to_dict()
                elif isinstance(engines_item_data, AnalysisCriticalityScoreBlock):
                    engines_item = engines_item_data.to_dict()
                elif isinstance(engines_item_data, AnalysisSubstitutionScoreBlock):
                    engines_item = engines_item_data.to_dict()
                elif isinstance(engines_item_data, AnalysisFlowExposureBlock):
                    engines_item = engines_item_data.to_dict()
                elif isinstance(engines_item_data, AnalysisRiskStateBlock):
                    engines_item = engines_item_data.to_dict()
                elif isinstance(engines_item_data, AnalysisSystemCascadeBlock):
                    engines_item = engines_item_data.to_dict()
                elif isinstance(engines_item_data, AnalysisControlConcentrationBlock):
                    engines_item = engines_item_data.to_dict()
                elif isinstance(engines_item_data, AnalysisRegimeAssessmentBlock):
                    engines_item = engines_item_data.to_dict()
                elif isinstance(engines_item_data, AnalysisEventPressureBlock):
                    engines_item = engines_item_data.to_dict()
                elif isinstance(engines_item_data, AnalysisPredictionConsensusBlock):
                    engines_item = engines_item_data.to_dict()
                elif isinstance(engines_item_data, AnalysisNetworkCentralityBlock):
                    engines_item = engines_item_data.to_dict()
                elif isinstance(engines_item_data, AnalysisCorroborationBlock):
                    engines_item = engines_item_data.to_dict()
                elif isinstance(engines_item_data, AnalysisFlowValueBlock):
                    engines_item = engines_item_data.to_dict()
                elif isinstance(engines_item_data, AnalysisWeaponizabilityBlock):
                    engines_item = engines_item_data.to_dict()
                else:
                    engines_item = engines_item_data.to_dict()

                engines.append(engines_item)



        relations: Union[Unset, list[dict[str, Any]]] = UNSET
        if not isinstance(self.relations, Unset):
            relations = []
            for relations_item_data in self.relations:
                relations_item = relations_item_data.to_dict()
                relations.append(relations_item)



        claims: Union[Unset, list[dict[str, Any]]] = UNSET
        if not isinstance(self.claims, Unset):
            claims = []
            for claims_item_data in self.claims:
                claims_item = claims_item_data.to_dict()
                claims.append(claims_item)




        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "chokepoint_id": chokepoint_id,
        })
        if disclaimer is not UNSET:
            field_dict["disclaimer"] = disclaimer
        if engines is not UNSET:
            field_dict["engines"] = engines
        if relations is not UNSET:
            field_dict["relations"] = relations
        if claims is not UNSET:
            field_dict["claims"] = claims

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.analysis_criticality_score_block import AnalysisCriticalityScoreBlock
        from ..models.analysis_weaponizability_block import AnalysisWeaponizabilityBlock
        from ..models.analysis_network_centrality_block import AnalysisNetworkCentralityBlock
        from ..models.analysis_relation_out import AnalysisRelationOut
        from ..models.analysis_claim_out import AnalysisClaimOut
        from ..models.analysis_flow_exposure_block import AnalysisFlowExposureBlock
        from ..models.analysis_event_pressure_block import AnalysisEventPressureBlock
        from ..models.analysis_evidence_quality_block import AnalysisEvidenceQualityBlock
        from ..models.analysis_prediction_consensus_block import AnalysisPredictionConsensusBlock
        from ..models.analysis_control_concentration_block import AnalysisControlConcentrationBlock
        from ..models.analysis_system_cascade_block import AnalysisSystemCascadeBlock
        from ..models.analysis_substitution_score_block import AnalysisSubstitutionScoreBlock
        from ..models.analysis_exposed_trade_loss_block import AnalysisExposedTradeLossBlock
        from ..models.analysis_regime_assessment_block import AnalysisRegimeAssessmentBlock
        from ..models.analysis_corroboration_block import AnalysisCorroborationBlock
        from ..models.analysis_flow_value_block import AnalysisFlowValueBlock
        from ..models.analysis_risk_state_block import AnalysisRiskStateBlock
        d = dict(src_dict)
        chokepoint_id = d.pop("chokepoint_id")

        disclaimer = d.pop("disclaimer", UNSET)

        engines = []
        _engines = d.pop("engines", UNSET)
        for engines_item_data in (_engines or []):
            def _parse_engines_item(data: object) -> Union['AnalysisControlConcentrationBlock', 'AnalysisCorroborationBlock', 'AnalysisCriticalityScoreBlock', 'AnalysisEventPressureBlock', 'AnalysisEvidenceQualityBlock', 'AnalysisExposedTradeLossBlock', 'AnalysisFlowExposureBlock', 'AnalysisFlowValueBlock', 'AnalysisNetworkCentralityBlock', 'AnalysisPredictionConsensusBlock', 'AnalysisRegimeAssessmentBlock', 'AnalysisRiskStateBlock', 'AnalysisSubstitutionScoreBlock', 'AnalysisSystemCascadeBlock', 'AnalysisWeaponizabilityBlock']:
                try:
                    if not isinstance(data, dict):
                        raise TypeError()
                    engines_item_type_0 = AnalysisEvidenceQualityBlock.from_dict(data)



                    return engines_item_type_0
                except: # noqa: E722
                    pass
                try:
                    if not isinstance(data, dict):
                        raise TypeError()
                    engines_item_type_1 = AnalysisCriticalityScoreBlock.from_dict(data)



                    return engines_item_type_1
                except: # noqa: E722
                    pass
                try:
                    if not isinstance(data, dict):
                        raise TypeError()
                    engines_item_type_2 = AnalysisSubstitutionScoreBlock.from_dict(data)



                    return engines_item_type_2
                except: # noqa: E722
                    pass
                try:
                    if not isinstance(data, dict):
                        raise TypeError()
                    engines_item_type_3 = AnalysisFlowExposureBlock.from_dict(data)



                    return engines_item_type_3
                except: # noqa: E722
                    pass
                try:
                    if not isinstance(data, dict):
                        raise TypeError()
                    engines_item_type_4 = AnalysisRiskStateBlock.from_dict(data)



                    return engines_item_type_4
                except: # noqa: E722
                    pass
                try:
                    if not isinstance(data, dict):
                        raise TypeError()
                    engines_item_type_5 = AnalysisSystemCascadeBlock.from_dict(data)



                    return engines_item_type_5
                except: # noqa: E722
                    pass
                try:
                    if not isinstance(data, dict):
                        raise TypeError()
                    engines_item_type_6 = AnalysisControlConcentrationBlock.from_dict(data)



                    return engines_item_type_6
                except: # noqa: E722
                    pass
                try:
                    if not isinstance(data, dict):
                        raise TypeError()
                    engines_item_type_7 = AnalysisRegimeAssessmentBlock.from_dict(data)



                    return engines_item_type_7
                except: # noqa: E722
                    pass
                try:
                    if not isinstance(data, dict):
                        raise TypeError()
                    engines_item_type_8 = AnalysisEventPressureBlock.from_dict(data)



                    return engines_item_type_8
                except: # noqa: E722
                    pass
                try:
                    if not isinstance(data, dict):
                        raise TypeError()
                    engines_item_type_9 = AnalysisPredictionConsensusBlock.from_dict(data)



                    return engines_item_type_9
                except: # noqa: E722
                    pass
                try:
                    if not isinstance(data, dict):
                        raise TypeError()
                    engines_item_type_10 = AnalysisNetworkCentralityBlock.from_dict(data)



                    return engines_item_type_10
                except: # noqa: E722
                    pass
                try:
                    if not isinstance(data, dict):
                        raise TypeError()
                    engines_item_type_11 = AnalysisCorroborationBlock.from_dict(data)



                    return engines_item_type_11
                except: # noqa: E722
                    pass
                try:
                    if not isinstance(data, dict):
                        raise TypeError()
                    engines_item_type_12 = AnalysisFlowValueBlock.from_dict(data)



                    return engines_item_type_12
                except: # noqa: E722
                    pass
                try:
                    if not isinstance(data, dict):
                        raise TypeError()
                    engines_item_type_13 = AnalysisWeaponizabilityBlock.from_dict(data)



                    return engines_item_type_13
                except: # noqa: E722
                    pass
                if not isinstance(data, dict):
                    raise TypeError()
                engines_item_type_14 = AnalysisExposedTradeLossBlock.from_dict(data)



                return engines_item_type_14

            engines_item = _parse_engines_item(engines_item_data)

            engines.append(engines_item)


        relations = []
        _relations = d.pop("relations", UNSET)
        for relations_item_data in (_relations or []):
            relations_item = AnalysisRelationOut.from_dict(relations_item_data)



            relations.append(relations_item)


        claims = []
        _claims = d.pop("claims", UNSET)
        for claims_item_data in (_claims or []):
            claims_item = AnalysisClaimOut.from_dict(claims_item_data)



            claims.append(claims_item)


        chokepoint_analysis_out = cls(
            chokepoint_id=chokepoint_id,
            disclaimer=disclaimer,
            engines=engines,
            relations=relations,
            claims=claims,
        )


        chokepoint_analysis_out.additional_properties = d
        return chokepoint_analysis_out

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
