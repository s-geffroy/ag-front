from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="SourceOut")



@_attrs_define
class SourceOut:
    """ 
        Attributes:
            source_id (str):
            source_name (str):
            source_level (str):
            url (Union[None, Unset, str]):
            redistribution_allowed (Union[None, Unset, str]):
            attribution_required (Union[None, Unset, bool]):
            license_risk (Union[None, Unset, str]):
            domain_relevance (Union[Any, None, Unset]):
            evidence_types (Union[Unset, list[str]]):
            storage_policy (Union[None, Unset, str]):
     """

    source_id: str
    source_name: str
    source_level: str
    url: Union[None, Unset, str] = UNSET
    redistribution_allowed: Union[None, Unset, str] = UNSET
    attribution_required: Union[None, Unset, bool] = UNSET
    license_risk: Union[None, Unset, str] = UNSET
    domain_relevance: Union[Any, None, Unset] = UNSET
    evidence_types: Union[Unset, list[str]] = UNSET
    storage_policy: Union[None, Unset, str] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        source_id = self.source_id

        source_name = self.source_name

        source_level = self.source_level

        url: Union[None, Unset, str]
        if isinstance(self.url, Unset):
            url = UNSET
        else:
            url = self.url

        redistribution_allowed: Union[None, Unset, str]
        if isinstance(self.redistribution_allowed, Unset):
            redistribution_allowed = UNSET
        else:
            redistribution_allowed = self.redistribution_allowed

        attribution_required: Union[None, Unset, bool]
        if isinstance(self.attribution_required, Unset):
            attribution_required = UNSET
        else:
            attribution_required = self.attribution_required

        license_risk: Union[None, Unset, str]
        if isinstance(self.license_risk, Unset):
            license_risk = UNSET
        else:
            license_risk = self.license_risk

        domain_relevance: Union[Any, None, Unset]
        if isinstance(self.domain_relevance, Unset):
            domain_relevance = UNSET
        else:
            domain_relevance = self.domain_relevance

        evidence_types: Union[Unset, list[str]] = UNSET
        if not isinstance(self.evidence_types, Unset):
            evidence_types = self.evidence_types



        storage_policy: Union[None, Unset, str]
        if isinstance(self.storage_policy, Unset):
            storage_policy = UNSET
        else:
            storage_policy = self.storage_policy


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "source_id": source_id,
            "source_name": source_name,
            "source_level": source_level,
        })
        if url is not UNSET:
            field_dict["url"] = url
        if redistribution_allowed is not UNSET:
            field_dict["redistribution_allowed"] = redistribution_allowed
        if attribution_required is not UNSET:
            field_dict["attribution_required"] = attribution_required
        if license_risk is not UNSET:
            field_dict["license_risk"] = license_risk
        if domain_relevance is not UNSET:
            field_dict["domain_relevance"] = domain_relevance
        if evidence_types is not UNSET:
            field_dict["evidence_types"] = evidence_types
        if storage_policy is not UNSET:
            field_dict["storage_policy"] = storage_policy

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        source_id = d.pop("source_id")

        source_name = d.pop("source_name")

        source_level = d.pop("source_level")

        def _parse_url(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        url = _parse_url(d.pop("url", UNSET))


        def _parse_redistribution_allowed(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        redistribution_allowed = _parse_redistribution_allowed(d.pop("redistribution_allowed", UNSET))


        def _parse_attribution_required(data: object) -> Union[None, Unset, bool]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, bool], data)

        attribution_required = _parse_attribution_required(d.pop("attribution_required", UNSET))


        def _parse_license_risk(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        license_risk = _parse_license_risk(d.pop("license_risk", UNSET))


        def _parse_domain_relevance(data: object) -> Union[Any, None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[Any, None, Unset], data)

        domain_relevance = _parse_domain_relevance(d.pop("domain_relevance", UNSET))


        evidence_types = cast(list[str], d.pop("evidence_types", UNSET))


        def _parse_storage_policy(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        storage_policy = _parse_storage_policy(d.pop("storage_policy", UNSET))


        source_out = cls(
            source_id=source_id,
            source_name=source_name,
            source_level=source_level,
            url=url,
            redistribution_allowed=redistribution_allowed,
            attribution_required=attribution_required,
            license_risk=license_risk,
            domain_relevance=domain_relevance,
            evidence_types=evidence_types,
            storage_policy=storage_policy,
        )


        source_out.additional_properties = d
        return source_out

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
