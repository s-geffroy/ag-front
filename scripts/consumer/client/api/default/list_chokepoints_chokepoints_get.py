from http import HTTPStatus
from typing import Any, Optional, Union, cast

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.chokepoint_list import ChokepointList
from ...models.http_validation_error import HTTPValidationError
from ...models.list_chokepoints_chokepoints_get_priority_class_type_0 import ListChokepointsChokepointsGetPriorityClassType0
from ...types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union



def _get_kwargs(
    *,
    family: Union[None, Unset, str] = UNSET,
    priority_class: Union[ListChokepointsChokepointsGetPriorityClassType0, None, Unset] = UNSET,
    macro_region: Union[None, Unset, str] = UNSET,
    include_tainted: Union[Unset, bool] = False,
    limit: Union[Unset, int] = 100,
    offset: Union[Unset, int] = 0,

) -> dict[str, Any]:
    

    

    params: dict[str, Any] = {}

    json_family: Union[None, Unset, str]
    if isinstance(family, Unset):
        json_family = UNSET
    else:
        json_family = family
    params["family"] = json_family

    json_priority_class: Union[None, Unset, str]
    if isinstance(priority_class, Unset):
        json_priority_class = UNSET
    elif isinstance(priority_class, ListChokepointsChokepointsGetPriorityClassType0):
        json_priority_class = priority_class.value
    else:
        json_priority_class = priority_class
    params["priority_class"] = json_priority_class

    json_macro_region: Union[None, Unset, str]
    if isinstance(macro_region, Unset):
        json_macro_region = UNSET
    else:
        json_macro_region = macro_region
    params["macro_region"] = json_macro_region

    params["include_tainted"] = include_tainted

    params["limit"] = limit

    params["offset"] = offset


    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}


    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/chokepoints",
        "params": params,
    }


    return _kwargs


def _parse_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Optional[Union[ChokepointList, HTTPValidationError]]:
    if response.status_code == 200:
        response_200 = ChokepointList.from_dict(response.json())



        return response_200
    if response.status_code == 422:
        response_422 = HTTPValidationError.from_dict(response.json())



        return response_422
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Response[Union[ChokepointList, HTTPValidationError]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient,
    family: Union[None, Unset, str] = UNSET,
    priority_class: Union[ListChokepointsChokepointsGetPriorityClassType0, None, Unset] = UNSET,
    macro_region: Union[None, Unset, str] = UNSET,
    include_tainted: Union[Unset, bool] = False,
    limit: Union[Unset, int] = 100,
    offset: Union[Unset, int] = 0,

) -> Response[Union[ChokepointList, HTTPValidationError]]:
    """ List Chokepoints

    Args:
        family (Union[None, Unset, str]):
        priority_class (Union[ListChokepointsChokepointsGetPriorityClassType0, None, Unset]):
        macro_region (Union[None, Unset, str]):
        include_tainted (Union[Unset, bool]):  Default: False.
        limit (Union[Unset, int]):  Default: 100.
        offset (Union[Unset, int]):  Default: 0.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[ChokepointList, HTTPValidationError]]
     """


    kwargs = _get_kwargs(
        family=family,
priority_class=priority_class,
macro_region=macro_region,
include_tainted=include_tainted,
limit=limit,
offset=offset,

    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)

def sync(
    *,
    client: AuthenticatedClient,
    family: Union[None, Unset, str] = UNSET,
    priority_class: Union[ListChokepointsChokepointsGetPriorityClassType0, None, Unset] = UNSET,
    macro_region: Union[None, Unset, str] = UNSET,
    include_tainted: Union[Unset, bool] = False,
    limit: Union[Unset, int] = 100,
    offset: Union[Unset, int] = 0,

) -> Optional[Union[ChokepointList, HTTPValidationError]]:
    """ List Chokepoints

    Args:
        family (Union[None, Unset, str]):
        priority_class (Union[ListChokepointsChokepointsGetPriorityClassType0, None, Unset]):
        macro_region (Union[None, Unset, str]):
        include_tainted (Union[Unset, bool]):  Default: False.
        limit (Union[Unset, int]):  Default: 100.
        offset (Union[Unset, int]):  Default: 0.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[ChokepointList, HTTPValidationError]
     """


    return sync_detailed(
        client=client,
family=family,
priority_class=priority_class,
macro_region=macro_region,
include_tainted=include_tainted,
limit=limit,
offset=offset,

    ).parsed

async def asyncio_detailed(
    *,
    client: AuthenticatedClient,
    family: Union[None, Unset, str] = UNSET,
    priority_class: Union[ListChokepointsChokepointsGetPriorityClassType0, None, Unset] = UNSET,
    macro_region: Union[None, Unset, str] = UNSET,
    include_tainted: Union[Unset, bool] = False,
    limit: Union[Unset, int] = 100,
    offset: Union[Unset, int] = 0,

) -> Response[Union[ChokepointList, HTTPValidationError]]:
    """ List Chokepoints

    Args:
        family (Union[None, Unset, str]):
        priority_class (Union[ListChokepointsChokepointsGetPriorityClassType0, None, Unset]):
        macro_region (Union[None, Unset, str]):
        include_tainted (Union[Unset, bool]):  Default: False.
        limit (Union[Unset, int]):  Default: 100.
        offset (Union[Unset, int]):  Default: 0.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[ChokepointList, HTTPValidationError]]
     """


    kwargs = _get_kwargs(
        family=family,
priority_class=priority_class,
macro_region=macro_region,
include_tainted=include_tainted,
limit=limit,
offset=offset,

    )

    response = await client.get_async_httpx_client().request(
        **kwargs
    )

    return _build_response(client=client, response=response)

async def asyncio(
    *,
    client: AuthenticatedClient,
    family: Union[None, Unset, str] = UNSET,
    priority_class: Union[ListChokepointsChokepointsGetPriorityClassType0, None, Unset] = UNSET,
    macro_region: Union[None, Unset, str] = UNSET,
    include_tainted: Union[Unset, bool] = False,
    limit: Union[Unset, int] = 100,
    offset: Union[Unset, int] = 0,

) -> Optional[Union[ChokepointList, HTTPValidationError]]:
    """ List Chokepoints

    Args:
        family (Union[None, Unset, str]):
        priority_class (Union[ListChokepointsChokepointsGetPriorityClassType0, None, Unset]):
        macro_region (Union[None, Unset, str]):
        include_tainted (Union[Unset, bool]):  Default: False.
        limit (Union[Unset, int]):  Default: 100.
        offset (Union[Unset, int]):  Default: 0.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[ChokepointList, HTTPValidationError]
     """


    return (await asyncio_detailed(
        client=client,
family=family,
priority_class=priority_class,
macro_region=macro_region,
include_tainted=include_tainted,
limit=limit,
offset=offset,

    )).parsed
