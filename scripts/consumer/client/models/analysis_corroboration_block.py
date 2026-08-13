from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..models.analysis_corroboration_block_key import AnalysisCorroborationBlockKey
from ..types import UNSET, Unset
from dateutil.parser import isoparse
from typing import cast
from typing import cast, Union
from typing import Union
import datetime

if TYPE_CHECKING:
  from ..models.analysis_corroboration_row import AnalysisCorroborationRow





T = TypeVar("T", bound="AnalysisCorroborationBlock")



@_attrs_define
class AnalysisCorroborationBlock:
    """ 
        Attributes:
            title (str):
            description (str):
            key (AnalysisCorroborationBlockKey):
            columns (Union[Unset, list[str]]):
            generated_at (Union[None, Unset, datetime.datetime]):
            rows (Union[Unset, list['AnalysisCorroborationRow']]):
     """

    title: str
    description: str
    key: AnalysisCorroborationBlockKey
    columns: Union[Unset, list[str]] = UNSET
    generated_at: Union[None, Unset, datetime.datetime] = UNSET
    rows: Union[Unset, list['AnalysisCorroborationRow']] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        from ..models.analysis_corroboration_row import AnalysisCorroborationRow
        title = self.title

        description = self.description

        key = self.key.value

        columns: Union[Unset, list[str]] = UNSET
        if not isinstance(self.columns, Unset):
            columns = self.columns



        generated_at: Union[None, Unset, str]
        if isinstance(self.generated_at, Unset):
            generated_at = UNSET
        elif isinstance(self.generated_at, datetime.datetime):
            generated_at = self.generated_at.isoformat()
        else:
            generated_at = self.generated_at

        rows: Union[Unset, list[dict[str, Any]]] = UNSET
        if not isinstance(self.rows, Unset):
            rows = []
            for rows_item_data in self.rows:
                rows_item = rows_item_data.to_dict()
                rows.append(rows_item)




        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "title": title,
            "description": description,
            "key": key,
        })
        if columns is not UNSET:
            field_dict["columns"] = columns
        if generated_at is not UNSET:
            field_dict["generated_at"] = generated_at
        if rows is not UNSET:
            field_dict["rows"] = rows

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.analysis_corroboration_row import AnalysisCorroborationRow
        d = dict(src_dict)
        title = d.pop("title")

        description = d.pop("description")

        key = AnalysisCorroborationBlockKey(d.pop("key"))




        columns = cast(list[str], d.pop("columns", UNSET))


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


        rows = []
        _rows = d.pop("rows", UNSET)
        for rows_item_data in (_rows or []):
            rows_item = AnalysisCorroborationRow.from_dict(rows_item_data)



            rows.append(rows_item)


        analysis_corroboration_block = cls(
            title=title,
            description=description,
            key=key,
            columns=columns,
            generated_at=generated_at,
            rows=rows,
        )


        analysis_corroboration_block.additional_properties = d
        return analysis_corroboration_block

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
