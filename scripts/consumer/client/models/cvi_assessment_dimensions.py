from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from typing import cast

if TYPE_CHECKING:
  from ..models.dimension_score import DimensionScore





T = TypeVar("T", bound="CviAssessmentDimensions")



@_attrs_define
class CviAssessmentDimensions:
    """ 
     """

    additional_properties: dict[str, 'DimensionScore'] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        from ..models.dimension_score import DimensionScore
        
        field_dict: dict[str, Any] = {}
        for prop_name, prop in self.additional_properties.items():
            field_dict[prop_name] = prop.to_dict()

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.dimension_score import DimensionScore
        d = dict(src_dict)
        cvi_assessment_dimensions = cls(
        )


        additional_properties = {}
        for prop_name, prop_dict in d.items():
            additional_property = DimensionScore.from_dict(prop_dict)



            additional_properties[prop_name] = additional_property

        cvi_assessment_dimensions.additional_properties = additional_properties
        return cvi_assessment_dimensions

    @property
    def additional_keys(self) -> list[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> 'DimensionScore':
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: 'DimensionScore') -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
