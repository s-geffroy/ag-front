from http import HTTPStatus
from typing import Any, Optional, Union, cast

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.chokepoint_analysis_list import ChokepointAnalysisList
from ...models.http_validation_error import HTTPValidationError
from ...models.list_chokepoint_analyses_chokepoint_analyses_get_priority_class_type_0 import ListChokepointAnalysesChokepointAnalysesGetPriorityClassType0
from ...types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union



def _get_kwargs(
    *,
    priority_class: Union[ListChokepointAnalysesChokepointAnalysesGetPriorityClassType0, None, Unset] = UNSET,
    family: Union[None, Unset, str] = UNSET,

) -> dict[str, Any]:
    

    

    params: dict[str, Any] = {}

    json_priority_class: Union[None, Unset, str]
    if isinstance(priority_class, Unset):
        json_priority_class = UNSET
    elif isinstance(priority_class, ListChokepointAnalysesChokepointAnalysesGetPriorityClassType0):
        json_priority_class = priority_class.value
    else:
        json_priority_class = priority_class
    params["priority_class"] = json_priority_class

    json_family: Union[None, Unset, str]
    if isinstance(family, Unset):
        json_family = UNSET
    else:
        json_family = family
    params["family"] = json_family


    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}


    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/chokepoint-analyses",
        "params": params,
    }


    return _kwargs


def _parse_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Optional[Union[ChokepointAnalysisList, HTTPValidationError]]:
    if response.status_code == 200:
        response_200 = ChokepointAnalysisList.from_dict(response.json())



        return response_200
    if response.status_code == 422:
        response_422 = HTTPValidationError.from_dict(response.json())



        return response_422
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Response[Union[ChokepointAnalysisList, HTTPValidationError]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient,
    priority_class: Union[ListChokepointAnalysesChokepointAnalysesGetPriorityClassType0, None, Unset] = UNSET,
    family: Union[None, Unset, str] = UNSET,

) -> Response[Union[ChokepointAnalysisList, HTTPValidationError]]:
    """ List Chokepoint Analyses

     Derived ToC + Leverage Points analyses available on disk (ADR 0027/0028).

    File-backed (read-only Markdown), not canonical data — see ANALYSIS_DISCLAIMER.

    Args:
        priority_class (Union[ListChokepointAnalysesChokepointAnalysesGetPriorityClassType0, None,
            Unset]):
        family (Union[None, Unset, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[ChokepointAnalysisList, HTTPValidationError]]
     """


    kwargs = _get_kwargs(
        priority_class=priority_class,
family=family,

    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)

def sync(
    *,
    client: AuthenticatedClient,
    priority_class: Union[ListChokepointAnalysesChokepointAnalysesGetPriorityClassType0, None, Unset] = UNSET,
    family: Union[None, Unset, str] = UNSET,

) -> Optional[Union[ChokepointAnalysisList, HTTPValidationError]]:
    """ List Chokepoint Analyses

     Derived ToC + Leverage Points analyses available on disk (ADR 0027/0028).

    File-backed (read-only Markdown), not canonical data — see ANALYSIS_DISCLAIMER.

    Args:
        priority_class (Union[ListChokepointAnalysesChokepointAnalysesGetPriorityClassType0, None,
            Unset]):
        family (Union[None, Unset, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[ChokepointAnalysisList, HTTPValidationError]
     """


    return sync_detailed(
        client=client,
priority_class=priority_class,
family=family,

    ).parsed

async def asyncio_detailed(
    *,
    client: AuthenticatedClient,
    priority_class: Union[ListChokepointAnalysesChokepointAnalysesGetPriorityClassType0, None, Unset] = UNSET,
    family: Union[None, Unset, str] = UNSET,

) -> Response[Union[ChokepointAnalysisList, HTTPValidationError]]:
    """ List Chokepoint Analyses

     Derived ToC + Leverage Points analyses available on disk (ADR 0027/0028).

    File-backed (read-only Markdown), not canonical data — see ANALYSIS_DISCLAIMER.

    Args:
        priority_class (Union[ListChokepointAnalysesChokepointAnalysesGetPriorityClassType0, None,
            Unset]):
        family (Union[None, Unset, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[ChokepointAnalysisList, HTTPValidationError]]
     """


    kwargs = _get_kwargs(
        priority_class=priority_class,
family=family,

    )

    response = await client.get_async_httpx_client().request(
        **kwargs
    )

    return _build_response(client=client, response=response)

async def asyncio(
    *,
    client: AuthenticatedClient,
    priority_class: Union[ListChokepointAnalysesChokepointAnalysesGetPriorityClassType0, None, Unset] = UNSET,
    family: Union[None, Unset, str] = UNSET,

) -> Optional[Union[ChokepointAnalysisList, HTTPValidationError]]:
    """ List Chokepoint Analyses

     Derived ToC + Leverage Points analyses available on disk (ADR 0027/0028).

    File-backed (read-only Markdown), not canonical data — see ANALYSIS_DISCLAIMER.

    Args:
        priority_class (Union[ListChokepointAnalysesChokepointAnalysesGetPriorityClassType0, None,
            Unset]):
        family (Union[None, Unset, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[ChokepointAnalysisList, HTTPValidationError]
     """


    return (await asyncio_detailed(
        client=client,
priority_class=priority_class,
family=family,

    )).parsed
