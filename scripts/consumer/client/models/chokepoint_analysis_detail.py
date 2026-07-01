from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union






T = TypeVar("T", bound="ChokepointAnalysisDetail")



@_attrs_define
class ChokepointAnalysisDetail:
    """ 
        Attributes:
            id (str):
            canonical_name (str):
            priority_class (str):
            family (str):
            type_ (Union[None, Unset, str]):
            macro_region (Union[None, Unset, str]):
            available_docs (Union[Unset, list[str]]):
            synthesis_md (Union[None, Unset, str]):
            theory_of_constraints_md (Union[None, Unset, str]):
            leverage_points_md (Union[None, Unset, str]):
            disclaimer (Union[Unset, str]):  Default: 'Derived systemic analysis (Theory of Constraints + Leverage Points,
                ADR 0027/0028). Figures are unvalidated public order-of-magnitude candidates pending human validation;
                capacities and geometry are schematic. No canonical mutation or priority promotion.'.
     """

    id: str
    canonical_name: str
    priority_class: str
    family: str
    type_: Union[None, Unset, str] = UNSET
    macro_region: Union[None, Unset, str] = UNSET
    available_docs: Union[Unset, list[str]] = UNSET
    synthesis_md: Union[None, Unset, str] = UNSET
    theory_of_constraints_md: Union[None, Unset, str] = UNSET
    leverage_points_md: Union[None, Unset, str] = UNSET
    disclaimer: Union[Unset, str] = 'Derived systemic analysis (Theory of Constraints + Leverage Points, ADR 0027/0028). Figures are unvalidated public order-of-magnitude candidates pending human validation; capacities and geometry are schematic. No canonical mutation or priority promotion.'
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        id = self.id

        canonical_name = self.canonical_name

        priority_class = self.priority_class

        family = self.family

        type_: Union[None, Unset, str]
        if isinstance(self.type_, Unset):
            type_ = UNSET
        else:
            type_ = self.type_

        macro_region: Union[None, Unset, str]
        if isinstance(self.macro_region, Unset):
            macro_region = UNSET
        else:
            macro_region = self.macro_region

        available_docs: Union[Unset, list[str]] = UNSET
        if not isinstance(self.available_docs, Unset):
            available_docs = self.available_docs



        synthesis_md: Union[None, Unset, str]
        if isinstance(self.synthesis_md, Unset):
            synthesis_md = UNSET
        else:
            synthesis_md = self.synthesis_md

        theory_of_constraints_md: Union[None, Unset, str]
        if isinstance(self.theory_of_constraints_md, Unset):
            theory_of_constraints_md = UNSET
        else:
            theory_of_constraints_md = self.theory_of_constraints_md

        leverage_points_md: Union[None, Unset, str]
        if isinstance(self.leverage_points_md, Unset):
            leverage_points_md = UNSET
        else:
            leverage_points_md = self.leverage_points_md

        disclaimer = self.disclaimer


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "id": id,
            "canonical_name": canonical_name,
            "priority_class": priority_class,
            "family": family,
        })
        if type_ is not UNSET:
            field_dict["type"] = type_
        if macro_region is not UNSET:
            field_dict["macro_region"] = macro_region
        if available_docs is not UNSET:
            field_dict["available_docs"] = available_docs
        if synthesis_md is not UNSET:
            field_dict["synthesis_md"] = synthesis_md
        if theory_of_constraints_md is not UNSET:
            field_dict["theory_of_constraints_md"] = theory_of_constraints_md
        if leverage_points_md is not UNSET:
            field_dict["leverage_points_md"] = leverage_points_md
        if disclaimer is not UNSET:
            field_dict["disclaimer"] = disclaimer

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        canonical_name = d.pop("canonical_name")

        priority_class = d.pop("priority_class")

        family = d.pop("family")

        def _parse_type_(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        type_ = _parse_type_(d.pop("type", UNSET))


        def _parse_macro_region(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        macro_region = _parse_macro_region(d.pop("macro_region", UNSET))


        available_docs = cast(list[str], d.pop("available_docs", UNSET))


        def _parse_synthesis_md(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        synthesis_md = _parse_synthesis_md(d.pop("synthesis_md", UNSET))


        def _parse_theory_of_constraints_md(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        theory_of_constraints_md = _parse_theory_of_constraints_md(d.pop("theory_of_constraints_md", UNSET))


        def _parse_leverage_points_md(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        leverage_points_md = _parse_leverage_points_md(d.pop("leverage_points_md", UNSET))


        disclaimer = d.pop("disclaimer", UNSET)

        chokepoint_analysis_detail = cls(
            id=id,
            canonical_name=canonical_name,
            priority_class=priority_class,
            family=family,
            type_=type_,
            macro_region=macro_region,
            available_docs=available_docs,
            synthesis_md=synthesis_md,
            theory_of_constraints_md=theory_of_constraints_md,
            leverage_points_md=leverage_points_md,
            disclaimer=disclaimer,
        )


        chokepoint_analysis_detail.additional_properties = d
        return chokepoint_analysis_detail

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
