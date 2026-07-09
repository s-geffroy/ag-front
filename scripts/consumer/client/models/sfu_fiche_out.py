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
  from ..models.sfu_verdict_out import SfuVerdictOut
  from ..models.sfu_dimension_out import SfuDimensionOut





T = TypeVar("T", bound="SfuFicheOut")



@_attrs_define
class SfuFicheOut:
    """ 
        Attributes:
            id (str):
            name (str):
            flow_type (str):
            priority_class (Union[None, Unset, str]):
            status (Union[None, Unset, str]):
            routes (Union[Unset, list[Any]]):
            control_actors (Union[Unset, list[Any]]):
            value_chain (Union[Unset, list[Any]]):
            scoring (Union[Unset, list['SfuDimensionOut']]):
            aggregates (Union[Unset, list[Any]]):
            integration (Union[Unset, list[Any]]):
            verdict (Union['SfuVerdictOut', None, Unset]):
            red_team (Union[Any, None, Unset]):
            disclaimer (Union[Unset, str]):  Default: 'Analytical results are derived, candidate outputs (not human-
                validated) and are never written back to canonical without a review gate.'.
     """

    id: str
    name: str
    flow_type: str
    priority_class: Union[None, Unset, str] = UNSET
    status: Union[None, Unset, str] = UNSET
    routes: Union[Unset, list[Any]] = UNSET
    control_actors: Union[Unset, list[Any]] = UNSET
    value_chain: Union[Unset, list[Any]] = UNSET
    scoring: Union[Unset, list['SfuDimensionOut']] = UNSET
    aggregates: Union[Unset, list[Any]] = UNSET
    integration: Union[Unset, list[Any]] = UNSET
    verdict: Union['SfuVerdictOut', None, Unset] = UNSET
    red_team: Union[Any, None, Unset] = UNSET
    disclaimer: Union[Unset, str] = 'Analytical results are derived, candidate outputs (not human-validated) and are never written back to canonical without a review gate.'
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        from ..models.sfu_verdict_out import SfuVerdictOut
        from ..models.sfu_dimension_out import SfuDimensionOut
        id = self.id

        name = self.name

        flow_type = self.flow_type

        priority_class: Union[None, Unset, str]
        if isinstance(self.priority_class, Unset):
            priority_class = UNSET
        else:
            priority_class = self.priority_class

        status: Union[None, Unset, str]
        if isinstance(self.status, Unset):
            status = UNSET
        else:
            status = self.status

        routes: Union[Unset, list[Any]] = UNSET
        if not isinstance(self.routes, Unset):
            routes = self.routes



        control_actors: Union[Unset, list[Any]] = UNSET
        if not isinstance(self.control_actors, Unset):
            control_actors = self.control_actors



        value_chain: Union[Unset, list[Any]] = UNSET
        if not isinstance(self.value_chain, Unset):
            value_chain = self.value_chain



        scoring: Union[Unset, list[dict[str, Any]]] = UNSET
        if not isinstance(self.scoring, Unset):
            scoring = []
            for scoring_item_data in self.scoring:
                scoring_item = scoring_item_data.to_dict()
                scoring.append(scoring_item)



        aggregates: Union[Unset, list[Any]] = UNSET
        if not isinstance(self.aggregates, Unset):
            aggregates = self.aggregates



        integration: Union[Unset, list[Any]] = UNSET
        if not isinstance(self.integration, Unset):
            integration = self.integration



        verdict: Union[None, Unset, dict[str, Any]]
        if isinstance(self.verdict, Unset):
            verdict = UNSET
        elif isinstance(self.verdict, SfuVerdictOut):
            verdict = self.verdict.to_dict()
        else:
            verdict = self.verdict

        red_team: Union[Any, None, Unset]
        if isinstance(self.red_team, Unset):
            red_team = UNSET
        else:
            red_team = self.red_team

        disclaimer = self.disclaimer


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "id": id,
            "name": name,
            "flow_type": flow_type,
        })
        if priority_class is not UNSET:
            field_dict["priority_class"] = priority_class
        if status is not UNSET:
            field_dict["status"] = status
        if routes is not UNSET:
            field_dict["routes"] = routes
        if control_actors is not UNSET:
            field_dict["control_actors"] = control_actors
        if value_chain is not UNSET:
            field_dict["value_chain"] = value_chain
        if scoring is not UNSET:
            field_dict["scoring"] = scoring
        if aggregates is not UNSET:
            field_dict["aggregates"] = aggregates
        if integration is not UNSET:
            field_dict["integration"] = integration
        if verdict is not UNSET:
            field_dict["verdict"] = verdict
        if red_team is not UNSET:
            field_dict["red_team"] = red_team
        if disclaimer is not UNSET:
            field_dict["disclaimer"] = disclaimer

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.sfu_verdict_out import SfuVerdictOut
        from ..models.sfu_dimension_out import SfuDimensionOut
        d = dict(src_dict)
        id = d.pop("id")

        name = d.pop("name")

        flow_type = d.pop("flow_type")

        def _parse_priority_class(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        priority_class = _parse_priority_class(d.pop("priority_class", UNSET))


        def _parse_status(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        status = _parse_status(d.pop("status", UNSET))


        routes = cast(list[Any], d.pop("routes", UNSET))


        control_actors = cast(list[Any], d.pop("control_actors", UNSET))


        value_chain = cast(list[Any], d.pop("value_chain", UNSET))


        scoring = []
        _scoring = d.pop("scoring", UNSET)
        for scoring_item_data in (_scoring or []):
            scoring_item = SfuDimensionOut.from_dict(scoring_item_data)



            scoring.append(scoring_item)


        aggregates = cast(list[Any], d.pop("aggregates", UNSET))


        integration = cast(list[Any], d.pop("integration", UNSET))


        def _parse_verdict(data: object) -> Union['SfuVerdictOut', None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                verdict_type_0 = SfuVerdictOut.from_dict(data)



                return verdict_type_0
            except: # noqa: E722
                pass
            return cast(Union['SfuVerdictOut', None, Unset], data)

        verdict = _parse_verdict(d.pop("verdict", UNSET))


        def _parse_red_team(data: object) -> Union[Any, None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[Any, None, Unset], data)

        red_team = _parse_red_team(d.pop("red_team", UNSET))


        disclaimer = d.pop("disclaimer", UNSET)

        sfu_fiche_out = cls(
            id=id,
            name=name,
            flow_type=flow_type,
            priority_class=priority_class,
            status=status,
            routes=routes,
            control_actors=control_actors,
            value_chain=value_chain,
            scoring=scoring,
            aggregates=aggregates,
            integration=integration,
            verdict=verdict,
            red_team=red_team,
            disclaimer=disclaimer,
        )


        sfu_fiche_out.additional_properties = d
        return sfu_fiche_out

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
