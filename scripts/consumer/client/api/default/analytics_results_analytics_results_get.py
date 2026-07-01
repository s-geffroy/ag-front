from http import HTTPStatus
from typing import Any, Optional, Union, cast

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.analytical_result_out import AnalyticalResultOut
from ...models.http_validation_error import HTTPValidationError
from ...types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union



def _get_kwargs(
    *,
    object_id: Union[None, Unset, str] = UNSET,
    engine_id: Union[None, Unset, str] = UNSET,
    status: Union[None, Unset, str] = UNSET,
    include_tainted: Union[Unset, bool] = False,
    limit: Union[Unset, int] = 200,

) -> dict[str, Any]:
    

    

    params: dict[str, Any] = {}

    json_object_id: Union[None, Unset, str]
    if isinstance(object_id, Unset):
        json_object_id = UNSET
    else:
        json_object_id = object_id
    params["object_id"] = json_object_id

    json_engine_id: Union[None, Unset, str]
    if isinstance(engine_id, Unset):
        json_engine_id = UNSET
    else:
        json_engine_id = engine_id
    params["engine_id"] = json_engine_id

    json_status: Union[None, Unset, str]
    if isinstance(status, Unset):
        json_status = UNSET
    else:
        json_status = status
    params["status"] = json_status

    params["include_tainted"] = include_tainted

    params["limit"] = limit


    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}


    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/analytics/results",
        "params": params,
    }


    return _kwargs


def _parse_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Optional[Union[HTTPValidationError, list['AnalyticalResultOut']]]:
    if response.status_code == 200:
        response_200 = []
        _response_200 = response.json()
        for response_200_item_data in (_response_200):
            response_200_item = AnalyticalResultOut.from_dict(response_200_item_data)



            response_200.append(response_200_item)

        return response_200
    if response.status_code == 422:
        response_422 = HTTPValidationError.from_dict(response.json())



        return response_422
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Response[Union[HTTPValidationError, list['AnalyticalResultOut']]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient,
    object_id: Union[None, Unset, str] = UNSET,
    engine_id: Union[None, Unset, str] = UNSET,
    status: Union[None, Unset, str] = UNSET,
    include_tainted: Union[Unset, bool] = False,
    limit: Union[Unset, int] = 200,

) -> Response[Union[HTTPValidationError, list['AnalyticalResultOut']]]:
    """ Analytics Results

     Read-only view of derived (candidate) analytical results. Taint-aware via the
    referenced canonical object; results for non-chokepoint objects are not filtered.

    Args:
        object_id (Union[None, Unset, str]):
        engine_id (Union[None, Unset, str]):
        status (Union[None, Unset, str]):
        include_tainted (Union[Unset, bool]):  Default: False.
        limit (Union[Unset, int]):  Default: 200.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, list['AnalyticalResultOut']]]
     """


    kwargs = _get_kwargs(
        object_id=object_id,
engine_id=engine_id,
status=status,
include_tainted=include_tainted,
limit=limit,

    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)

def sync(
    *,
    client: AuthenticatedClient,
    object_id: Union[None, Unset, str] = UNSET,
    engine_id: Union[None, Unset, str] = UNSET,
    status: Union[None, Unset, str] = UNSET,
    include_tainted: Union[Unset, bool] = False,
    limit: Union[Unset, int] = 200,

) -> Optional[Union[HTTPValidationError, list['AnalyticalResultOut']]]:
    """ Analytics Results

     Read-only view of derived (candidate) analytical results. Taint-aware via the
    referenced canonical object; results for non-chokepoint objects are not filtered.

    Args:
        object_id (Union[None, Unset, str]):
        engine_id (Union[None, Unset, str]):
        status (Union[None, Unset, str]):
        include_tainted (Union[Unset, bool]):  Default: False.
        limit (Union[Unset, int]):  Default: 200.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, list['AnalyticalResultOut']]
     """


    return sync_detailed(
        client=client,
object_id=object_id,
engine_id=engine_id,
status=status,
include_tainted=include_tainted,
limit=limit,

    ).parsed

async def asyncio_detailed(
    *,
    client: AuthenticatedClient,
    object_id: Union[None, Unset, str] = UNSET,
    engine_id: Union[None, Unset, str] = UNSET,
    status: Union[None, Unset, str] = UNSET,
    include_tainted: Union[Unset, bool] = False,
    limit: Union[Unset, int] = 200,

) -> Response[Union[HTTPValidationError, list['AnalyticalResultOut']]]:
    """ Analytics Results

     Read-only view of derived (candidate) analytical results. Taint-aware via the
    referenced canonical object; results for non-chokepoint objects are not filtered.

    Args:
        object_id (Union[None, Unset, str]):
        engine_id (Union[None, Unset, str]):
        status (Union[None, Unset, str]):
        include_tainted (Union[Unset, bool]):  Default: False.
        limit (Union[Unset, int]):  Default: 200.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, list['AnalyticalResultOut']]]
     """


    kwargs = _get_kwargs(
        object_id=object_id,
engine_id=engine_id,
status=status,
include_tainted=include_tainted,
limit=limit,

    )

    response = await client.get_async_httpx_client().request(
        **kwargs
    )

    return _build_response(client=client, response=response)

async def asyncio(
    *,
    client: AuthenticatedClient,
    object_id: Union[None, Unset, str] = UNSET,
    engine_id: Union[None, Unset, str] = UNSET,
    status: Union[None, Unset, str] = UNSET,
    include_tainted: Union[Unset, bool] = False,
    limit: Union[Unset, int] = 200,

) -> Optional[Union[HTTPValidationError, list['AnalyticalResultOut']]]:
    """ Analytics Results

     Read-only view of derived (candidate) analytical results. Taint-aware via the
    referenced canonical object; results for non-chokepoint objects are not filtered.

    Args:
        object_id (Union[None, Unset, str]):
        engine_id (Union[None, Unset, str]):
        status (Union[None, Unset, str]):
        include_tainted (Union[Unset, bool]):  Default: False.
        limit (Union[Unset, int]):  Default: 200.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, list['AnalyticalResultOut']]
     """


    return (await asyncio_detailed(
        client=client,
object_id=object_id,
engine_id=engine_id,
status=status,
include_tainted=include_tainted,
limit=limit,

    )).parsed
