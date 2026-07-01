from collections.abc import Mapping
from typing import Any, TypeVar, Optional, BinaryIO, TextIO, TYPE_CHECKING

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

from ..types import UNSET, Unset
from dateutil.parser import isoparse
from typing import cast
from typing import cast, Union
from typing import Union
import datetime






T = TypeVar("T", bound="PerceptionSignalOut")



@_attrs_define
class PerceptionSignalOut:
    """ 
        Attributes:
            market_question (Union[None, Unset, str]):
            signal_family (Union[None, Unset, str]):
            classification (Union[None, Unset, str]):
            implied_probability (Union[None, Unset, float]):
            probability_change_24h (Union[None, Unset, float]):
            liquidity (Union[None, Unset, float]):
            volume_24h (Union[None, Unset, float]):
            perception_signal_score (Union[None, Unset, int]):
            proposed_action (Union[None, Unset, str]):
            observed_at (Union[None, Unset, datetime.datetime]):
     """

    market_question: Union[None, Unset, str] = UNSET
    signal_family: Union[None, Unset, str] = UNSET
    classification: Union[None, Unset, str] = UNSET
    implied_probability: Union[None, Unset, float] = UNSET
    probability_change_24h: Union[None, Unset, float] = UNSET
    liquidity: Union[None, Unset, float] = UNSET
    volume_24h: Union[None, Unset, float] = UNSET
    perception_signal_score: Union[None, Unset, int] = UNSET
    proposed_action: Union[None, Unset, str] = UNSET
    observed_at: Union[None, Unset, datetime.datetime] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)


    def to_dict(self) -> dict[str, Any]:
        market_question: Union[None, Unset, str]
        if isinstance(self.market_question, Unset):
            market_question = UNSET
        else:
            market_question = self.market_question

        signal_family: Union[None, Unset, str]
        if isinstance(self.signal_family, Unset):
            signal_family = UNSET
        else:
            signal_family = self.signal_family

        classification: Union[None, Unset, str]
        if isinstance(self.classification, Unset):
            classification = UNSET
        else:
            classification = self.classification

        implied_probability: Union[None, Unset, float]
        if isinstance(self.implied_probability, Unset):
            implied_probability = UNSET
        else:
            implied_probability = self.implied_probability

        probability_change_24h: Union[None, Unset, float]
        if isinstance(self.probability_change_24h, Unset):
            probability_change_24h = UNSET
        else:
            probability_change_24h = self.probability_change_24h

        liquidity: Union[None, Unset, float]
        if isinstance(self.liquidity, Unset):
            liquidity = UNSET
        else:
            liquidity = self.liquidity

        volume_24h: Union[None, Unset, float]
        if isinstance(self.volume_24h, Unset):
            volume_24h = UNSET
        else:
            volume_24h = self.volume_24h

        perception_signal_score: Union[None, Unset, int]
        if isinstance(self.perception_signal_score, Unset):
            perception_signal_score = UNSET
        else:
            perception_signal_score = self.perception_signal_score

        proposed_action: Union[None, Unset, str]
        if isinstance(self.proposed_action, Unset):
            proposed_action = UNSET
        else:
            proposed_action = self.proposed_action

        observed_at: Union[None, Unset, str]
        if isinstance(self.observed_at, Unset):
            observed_at = UNSET
        elif isinstance(self.observed_at, datetime.datetime):
            observed_at = self.observed_at.isoformat()
        else:
            observed_at = self.observed_at


        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if market_question is not UNSET:
            field_dict["market_question"] = market_question
        if signal_family is not UNSET:
            field_dict["signal_family"] = signal_family
        if classification is not UNSET:
            field_dict["classification"] = classification
        if implied_probability is not UNSET:
            field_dict["implied_probability"] = implied_probability
        if probability_change_24h is not UNSET:
            field_dict["probability_change_24h"] = probability_change_24h
        if liquidity is not UNSET:
            field_dict["liquidity"] = liquidity
        if volume_24h is not UNSET:
            field_dict["volume_24h"] = volume_24h
        if perception_signal_score is not UNSET:
            field_dict["perception_signal_score"] = perception_signal_score
        if proposed_action is not UNSET:
            field_dict["proposed_action"] = proposed_action
        if observed_at is not UNSET:
            field_dict["observed_at"] = observed_at

        return field_dict



    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        def _parse_market_question(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        market_question = _parse_market_question(d.pop("market_question", UNSET))


        def _parse_signal_family(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        signal_family = _parse_signal_family(d.pop("signal_family", UNSET))


        def _parse_classification(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        classification = _parse_classification(d.pop("classification", UNSET))


        def _parse_implied_probability(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        implied_probability = _parse_implied_probability(d.pop("implied_probability", UNSET))


        def _parse_probability_change_24h(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        probability_change_24h = _parse_probability_change_24h(d.pop("probability_change_24h", UNSET))


        def _parse_liquidity(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        liquidity = _parse_liquidity(d.pop("liquidity", UNSET))


        def _parse_volume_24h(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        volume_24h = _parse_volume_24h(d.pop("volume_24h", UNSET))


        def _parse_perception_signal_score(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        perception_signal_score = _parse_perception_signal_score(d.pop("perception_signal_score", UNSET))


        def _parse_proposed_action(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        proposed_action = _parse_proposed_action(d.pop("proposed_action", UNSET))


        def _parse_observed_at(data: object) -> Union[None, Unset, datetime.datetime]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                observed_at_type_0 = isoparse(data)



                return observed_at_type_0
            except: # noqa: E722
                pass
            return cast(Union[None, Unset, datetime.datetime], data)

        observed_at = _parse_observed_at(d.pop("observed_at", UNSET))


        perception_signal_out = cls(
            market_question=market_question,
            signal_family=signal_family,
            classification=classification,
            implied_probability=implied_probability,
            probability_change_24h=probability_change_24h,
            liquidity=liquidity,
            volume_24h=volume_24h,
            perception_signal_score=perception_signal_score,
            proposed_action=proposed_action,
            observed_at=observed_at,
        )


        perception_signal_out.additional_properties = d
        return perception_signal_out

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
