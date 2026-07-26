from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..models.news_cluster_out_status import NewsClusterOutStatus
from ..types import UNSET, Unset
from dateutil.parser import isoparse
from typing import cast
from typing import cast, Union
from typing import Union
import datetime

if TYPE_CHECKING:
  from ..models.news_source_ref import NewsSourceRef
  from ..models.news_cluster_chokepoint import NewsClusterChokepoint





T = TypeVar("T", bound="NewsClusterOut")



@_attrs_define
class NewsClusterOut:
    """ One real-world event, as reported by one or more outlets.

    `article_count`, `source_domains`, `articles`, `first_seen`, `last_seen` and
    `affected_chokepoints` are SERVER-COMPUTED from the real signal rows — the model is never asked
    for them and could not be believed if it supplied them (ADR 0076 trust boundary).

        Attributes:
            cluster_id (str):
            headline (Union[None, Unset, str]):
            summary_text (Union[None, Unset, str]):
            event_category (Union[None, Unset, str]):
            geographic_scope (Union[None, Unset, str]):
            salience_score (Union[None, Unset, float]):
            article_count (Union[Unset, int]):  Default: 0.
            source_domains (Union[Unset, list[str]]):
            articles (Union[Unset, list['NewsSourceRef']]):
            affected_chokepoints (Union[Unset, list['NewsClusterChokepoint']]):
            first_seen (Union[None, Unset, datetime.date]):
            last_seen (Union[None, Unset, datetime.date]):
            model (Union[None, Unset, str]):
            prompt_version (Union[None, Unset, str]):
            offline_facade (Union[Unset, bool]):  Default: False.
            license_taint (Union[Unset, bool]):  Default: False.
            status (Union[Unset, NewsClusterOutStatus]):  Default: NewsClusterOutStatus.CANDIDATE.
            generated_at (Union[None, Unset, datetime.datetime]):
     """

    cluster_id: str
    headline: Union[None, Unset, str] = UNSET
    summary_text: Union[None, Unset, str] = UNSET
    event_category: Union[None, Unset, str] = UNSET
    geographic_scope: Union[None, Unset, str] = UNSET
    salience_score: Union[None, Unset, float] = UNSET
    article_count: Union[Unset, int] = 0
    source_domains: Union[Unset, list[str]] = UNSET
    articles: Union[Unset, list['NewsSourceRef']] = UNSET
    affected_chokepoints: Union[Unset, list['NewsClusterChokepoint']] = UNSET
    first_seen: Union[None, Unset, datetime.date] = UNSET
    last_seen: Union[None, Unset, datetime.date] = UNSET
    model: Union[None, Unset, str] = UNSET
    prompt_version: Union[None, Unset, str] = UNSET
    offline_facade: Union[Unset, bool] = False
    license_taint: Union[Unset, bool] = False
    status: Union[Unset, NewsClusterOutStatus] = NewsClusterOutStatus.CANDIDATE
    generated_at: Union[None, Unset, datetime.datetime] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        from ..models.news_source_ref import NewsSourceRef
        from ..models.news_cluster_chokepoint import NewsClusterChokepoint
        cluster_id = self.cluster_id

        headline: Union[None, Unset, str]
        if isinstance(self.headline, Unset):
            headline = UNSET
        else:
            headline = self.headline

        summary_text: Union[None, Unset, str]
        if isinstance(self.summary_text, Unset):
            summary_text = UNSET
        else:
            summary_text = self.summary_text

        event_category: Union[None, Unset, str]
        if isinstance(self.event_category, Unset):
            event_category = UNSET
        else:
            event_category = self.event_category

        geographic_scope: Union[None, Unset, str]
        if isinstance(self.geographic_scope, Unset):
            geographic_scope = UNSET
        else:
            geographic_scope = self.geographic_scope

        salience_score: Union[None, Unset, float]
        if isinstance(self.salience_score, Unset):
            salience_score = UNSET
        else:
            salience_score = self.salience_score

        article_count = self.article_count

        source_domains: Union[Unset, list[str]] = UNSET
        if not isinstance(self.source_domains, Unset):
            source_domains = self.source_domains



        articles: Union[Unset, list[dict[str, Any]]] = UNSET
        if not isinstance(self.articles, Unset):
            articles = []
            for articles_item_data in self.articles:
                articles_item = articles_item_data.to_dict()
                articles.append(articles_item)



        affected_chokepoints: Union[Unset, list[dict[str, Any]]] = UNSET
        if not isinstance(self.affected_chokepoints, Unset):
            affected_chokepoints = []
            for affected_chokepoints_item_data in self.affected_chokepoints:
                affected_chokepoints_item = affected_chokepoints_item_data.to_dict()
                affected_chokepoints.append(affected_chokepoints_item)



        first_seen: Union[None, Unset, str]
        if isinstance(self.first_seen, Unset):
            first_seen = UNSET
        elif isinstance(self.first_seen, datetime.date):
            first_seen = self.first_seen.isoformat()
        else:
            first_seen = self.first_seen

        last_seen: Union[None, Unset, str]
        if isinstance(self.last_seen, Unset):
            last_seen = UNSET
        elif isinstance(self.last_seen, datetime.date):
            last_seen = self.last_seen.isoformat()
        else:
            last_seen = self.last_seen

        model: Union[None, Unset, str]
        if isinstance(self.model, Unset):
            model = UNSET
        else:
            model = self.model

        prompt_version: Union[None, Unset, str]
        if isinstance(self.prompt_version, Unset):
            prompt_version = UNSET
        else:
            prompt_version = self.prompt_version

        offline_facade = self.offline_facade

        license_taint = self.license_taint

        status: Union[Unset, str] = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value


        generated_at: Union[None, Unset, str]
        if isinstance(self.generated_at, Unset):
            generated_at = UNSET
        elif isinstance(self.generated_at, datetime.datetime):
            generated_at = self.generated_at.isoformat()
        else:
            generated_at = self.generated_at


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "cluster_id": cluster_id,
        })
        if headline is not UNSET:
            field_dict["headline"] = headline
        if summary_text is not UNSET:
            field_dict["summary_text"] = summary_text
        if event_category is not UNSET:
            field_dict["event_category"] = event_category
        if geographic_scope is not UNSET:
            field_dict["geographic_scope"] = geographic_scope
        if salience_score is not UNSET:
            field_dict["salience_score"] = salience_score
        if article_count is not UNSET:
            field_dict["article_count"] = article_count
        if source_domains is not UNSET:
            field_dict["source_domains"] = source_domains
        if articles is not UNSET:
            field_dict["articles"] = articles
        if affected_chokepoints is not UNSET:
            field_dict["affected_chokepoints"] = affected_chokepoints
        if first_seen is not UNSET:
            field_dict["first_seen"] = first_seen
        if last_seen is not UNSET:
            field_dict["last_seen"] = last_seen
        if model is not UNSET:
            field_dict["model"] = model
        if prompt_version is not UNSET:
            field_dict["prompt_version"] = prompt_version
        if offline_facade is not UNSET:
            field_dict["offline_facade"] = offline_facade
        if license_taint is not UNSET:
            field_dict["license_taint"] = license_taint
        if status is not UNSET:
            field_dict["status"] = status
        if generated_at is not UNSET:
            field_dict["generated_at"] = generated_at

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.news_source_ref import NewsSourceRef
        from ..models.news_cluster_chokepoint import NewsClusterChokepoint
        d = dict(src_dict)
        cluster_id = d.pop("cluster_id")

        def _parse_headline(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        headline = _parse_headline(d.pop("headline", UNSET))


        def _parse_summary_text(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        summary_text = _parse_summary_text(d.pop("summary_text", UNSET))


        def _parse_event_category(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        event_category = _parse_event_category(d.pop("event_category", UNSET))


        def _parse_geographic_scope(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        geographic_scope = _parse_geographic_scope(d.pop("geographic_scope", UNSET))


        def _parse_salience_score(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        salience_score = _parse_salience_score(d.pop("salience_score", UNSET))


        article_count = d.pop("article_count", UNSET)

        source_domains = cast(list[str], d.pop("source_domains", UNSET))


        articles = []
        _articles = d.pop("articles", UNSET)
        for articles_item_data in (_articles or []):
            articles_item = NewsSourceRef.from_dict(articles_item_data)



            articles.append(articles_item)


        affected_chokepoints = []
        _affected_chokepoints = d.pop("affected_chokepoints", UNSET)
        for affected_chokepoints_item_data in (_affected_chokepoints or []):
            affected_chokepoints_item = NewsClusterChokepoint.from_dict(affected_chokepoints_item_data)



            affected_chokepoints.append(affected_chokepoints_item)


        def _parse_first_seen(data: object) -> Union[None, Unset, datetime.date]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                first_seen_type_0 = isoparse(data).date()



                return first_seen_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, Unset, datetime.date], data)

        first_seen = _parse_first_seen(d.pop("first_seen", UNSET))


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


        def _parse_model(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        model = _parse_model(d.pop("model", UNSET))


        def _parse_prompt_version(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        prompt_version = _parse_prompt_version(d.pop("prompt_version", UNSET))


        offline_facade = d.pop("offline_facade", UNSET)

        license_taint = d.pop("license_taint", UNSET)

        _status = d.pop("status", UNSET)
        status: Union[Unset, NewsClusterOutStatus]
        if isinstance(_status,  Unset):
            status = UNSET
        else:
            status = NewsClusterOutStatus(_status)




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


        news_cluster_out = cls(
            cluster_id=cluster_id,
            headline=headline,
            summary_text=summary_text,
            event_category=event_category,
            geographic_scope=geographic_scope,
            salience_score=salience_score,
            article_count=article_count,
            source_domains=source_domains,
            articles=articles,
            affected_chokepoints=affected_chokepoints,
            first_seen=first_seen,
            last_seen=last_seen,
            model=model,
            prompt_version=prompt_version,
            offline_facade=offline_facade,
            license_taint=license_taint,
            status=status,
            generated_at=generated_at,
        )


        news_cluster_out.additional_properties = d
        return news_cluster_out

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
