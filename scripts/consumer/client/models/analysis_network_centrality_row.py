from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="AnalysisNetworkCentralityRow")



@_attrs_define
class AnalysisNetworkCentralityRow:
    """ One `network_centrality` row (`analytics.network_centrality_result`).

        Attributes:
            betweenness (Union[None, Unset, float]):
            pagerank (Union[None, Unset, float]):
            eigenvector (Union[None, Unset, float]):
            articulation_point (Union[None, Unset, bool]):
            cascade_impact_if_removed (Union[None, Unset, float]):
            isolated_subnetworks_count (Union[None, Unset, int]):
            reachable_nodes_lost (Union[None, Unset, int]):
     """

    betweenness: Union[None, Unset, float] = UNSET
    pagerank: Union[None, Unset, float] = UNSET
    eigenvector: Union[None, Unset, float] = UNSET
    articulation_point: Union[None, Unset, bool] = UNSET
    cascade_impact_if_removed: Union[None, Unset, float] = UNSET
    isolated_subnetworks_count: Union[None, Unset, int] = UNSET
    reachable_nodes_lost: Union[None, Unset, int] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        betweenness: Union[None, Unset, float]
        if isinstance(self.betweenness, Unset):
            betweenness = UNSET
        else:
            betweenness = self.betweenness

        pagerank: Union[None, Unset, float]
        if isinstance(self.pagerank, Unset):
            pagerank = UNSET
        else:
            pagerank = self.pagerank

        eigenvector: Union[None, Unset, float]
        if isinstance(self.eigenvector, Unset):
            eigenvector = UNSET
        else:
            eigenvector = self.eigenvector

        articulation_point: Union[None, Unset, bool]
        if isinstance(self.articulation_point, Unset):
            articulation_point = UNSET
        else:
            articulation_point = self.articulation_point

        cascade_impact_if_removed: Union[None, Unset, float]
        if isinstance(self.cascade_impact_if_removed, Unset):
            cascade_impact_if_removed = UNSET
        else:
            cascade_impact_if_removed = self.cascade_impact_if_removed

        isolated_subnetworks_count: Union[None, Unset, int]
        if isinstance(self.isolated_subnetworks_count, Unset):
            isolated_subnetworks_count = UNSET
        else:
            isolated_subnetworks_count = self.isolated_subnetworks_count

        reachable_nodes_lost: Union[None, Unset, int]
        if isinstance(self.reachable_nodes_lost, Unset):
            reachable_nodes_lost = UNSET
        else:
            reachable_nodes_lost = self.reachable_nodes_lost


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if betweenness is not UNSET:
            field_dict["betweenness"] = betweenness
        if pagerank is not UNSET:
            field_dict["pagerank"] = pagerank
        if eigenvector is not UNSET:
            field_dict["eigenvector"] = eigenvector
        if articulation_point is not UNSET:
            field_dict["articulation_point"] = articulation_point
        if cascade_impact_if_removed is not UNSET:
            field_dict["cascade_impact_if_removed"] = cascade_impact_if_removed
        if isolated_subnetworks_count is not UNSET:
            field_dict["isolated_subnetworks_count"] = isolated_subnetworks_count
        if reachable_nodes_lost is not UNSET:
            field_dict["reachable_nodes_lost"] = reachable_nodes_lost

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        def _parse_betweenness(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        betweenness = _parse_betweenness(d.pop("betweenness", UNSET))


        def _parse_pagerank(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        pagerank = _parse_pagerank(d.pop("pagerank", UNSET))


        def _parse_eigenvector(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        eigenvector = _parse_eigenvector(d.pop("eigenvector", UNSET))


        def _parse_articulation_point(data: object) -> Union[None, Unset, bool]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, bool], data)

        articulation_point = _parse_articulation_point(d.pop("articulation_point", UNSET))


        def _parse_cascade_impact_if_removed(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        cascade_impact_if_removed = _parse_cascade_impact_if_removed(d.pop("cascade_impact_if_removed", UNSET))


        def _parse_isolated_subnetworks_count(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        isolated_subnetworks_count = _parse_isolated_subnetworks_count(d.pop("isolated_subnetworks_count", UNSET))


        def _parse_reachable_nodes_lost(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        reachable_nodes_lost = _parse_reachable_nodes_lost(d.pop("reachable_nodes_lost", UNSET))


        analysis_network_centrality_row = cls(
            betweenness=betweenness,
            pagerank=pagerank,
            eigenvector=eigenvector,
            articulation_point=articulation_point,
            cascade_impact_if_removed=cascade_impact_if_removed,
            isolated_subnetworks_count=isolated_subnetworks_count,
            reachable_nodes_lost=reachable_nodes_lost,
        )


        analysis_network_centrality_row.additional_properties = d
        return analysis_network_centrality_row

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
