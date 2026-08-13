from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..models.news_source_ref_country_source import NewsSourceRefCountrySource
from ..types import UNSET, Unset
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="NewsSourceRef")



@_attrs_define
class NewsSourceRef:
    """ One collected article inside a cluster. Server-derived from observations.event_signal.

        Attributes:
            title (Union[None, Unset, str]):
            url (Union[None, Unset, str]):
            outlet (Union[None, Unset, str]):
            source_id (Union[None, Unset, str]):
            observed_on (Union[None, Unset, str]):
            country (Union[None, Unset, str]):
            country_source (Union[Unset, NewsSourceRefCountrySource]):  Default: NewsSourceRefCountrySource.UNKNOWN.
     """

    title: Union[None, Unset, str] = UNSET
    url: Union[None, Unset, str] = UNSET
    outlet: Union[None, Unset, str] = UNSET
    source_id: Union[None, Unset, str] = UNSET
    observed_on: Union[None, Unset, str] = UNSET
    country: Union[None, Unset, str] = UNSET
    country_source: Union[Unset, NewsSourceRefCountrySource] = NewsSourceRefCountrySource.UNKNOWN
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        title: Union[None, Unset, str]
        if isinstance(self.title, Unset):
            title = UNSET
        else:
            title = self.title

        url: Union[None, Unset, str]
        if isinstance(self.url, Unset):
            url = UNSET
        else:
            url = self.url

        outlet: Union[None, Unset, str]
        if isinstance(self.outlet, Unset):
            outlet = UNSET
        else:
            outlet = self.outlet

        source_id: Union[None, Unset, str]
        if isinstance(self.source_id, Unset):
            source_id = UNSET
        else:
            source_id = self.source_id

        observed_on: Union[None, Unset, str]
        if isinstance(self.observed_on, Unset):
            observed_on = UNSET
        else:
            observed_on = self.observed_on

        country: Union[None, Unset, str]
        if isinstance(self.country, Unset):
            country = UNSET
        else:
            country = self.country

        country_source: Union[Unset, str] = UNSET
        if not isinstance(self.country_source, Unset):
            country_source = self.country_source.value



        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if title is not UNSET:
            field_dict["title"] = title
        if url is not UNSET:
            field_dict["url"] = url
        if outlet is not UNSET:
            field_dict["outlet"] = outlet
        if source_id is not UNSET:
            field_dict["source_id"] = source_id
        if observed_on is not UNSET:
            field_dict["observed_on"] = observed_on
        if country is not UNSET:
            field_dict["country"] = country
        if country_source is not UNSET:
            field_dict["country_source"] = country_source

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        def _parse_title(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        title = _parse_title(d.pop("title", UNSET))


        def _parse_url(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        url = _parse_url(d.pop("url", UNSET))


        def _parse_outlet(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        outlet = _parse_outlet(d.pop("outlet", UNSET))


        def _parse_source_id(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        source_id = _parse_source_id(d.pop("source_id", UNSET))


        def _parse_observed_on(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        observed_on = _parse_observed_on(d.pop("observed_on", UNSET))


        def _parse_country(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        country = _parse_country(d.pop("country", UNSET))


        _country_source = d.pop("country_source", UNSET)
        country_source: Union[Unset, NewsSourceRefCountrySource]
        if isinstance(_country_source,  Unset):
            country_source = UNSET
        else:
            country_source = NewsSourceRefCountrySource(_country_source)




        news_source_ref = cls(
            title=title,
            url=url,
            outlet=outlet,
            source_id=source_id,
            observed_on=observed_on,
            country=country,
            country_source=country_source,
        )


        news_source_ref.additional_properties = d
        return news_source_ref

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
