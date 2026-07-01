from http import HTTPStatus
from typing import Any, Optional, Union, cast

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.http_validation_error import HTTPValidationError
from ...models.perception_signal_list import PerceptionSignalList
from ...types import UNSET, Unset
from typing import cast
from typing import Union



def _get_kwargs(
    chokepoint_id: str,
    *,
    limit: Union[Unset, int] = 200,

) -> dict[str, Any]:
    

    

    params: dict[str, Any] = {}

    params["limit"] = limit


    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}


    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/chokepoints/{chokepoint_id}/perception-signals".format(chokepoint_id=chokepoint_id,),
        "params": params,
    }


    return _kwargs


def _parse_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Optional[Union[HTTPValidationError, PerceptionSignalList]]:
    if response.status_code == 200:
        response_200 = PerceptionSignalList.from_dict(response.json())



        return response_200
    if response.status_code == 422:
        response_422 = HTTPValidationError.from_dict(response.json())



        return response_422
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Response[Union[HTTPValidationError, PerceptionSignalList]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    chokepoint_id: str,
    *,
    client: AuthenticatedClient,
    limit: Union[Unset, int] = 200,

) -> Response[Union[HTTPValidationError, PerceptionSignalList]]:
    """ Get Perception Signals

     Polymarket P3 perception signals for a chokepoint (ADR 0037) — anticipation, not evidence.

    The source (`polymarket_gamma`) is uncleared (high license risk), so this endpoint is gated on
    the `read_tainted` scope unconditionally; a plain `read` key gets 403.

    Args:
        chokepoint_id (str):
        limit (Union[Unset, int]):  Default: 200.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, PerceptionSignalList]]
     """


    kwargs = _get_kwargs(
        chokepoint_id=chokepoint_id,
limit=limit,

    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)

def sync(
    chokepoint_id: str,
    *,
    client: AuthenticatedClient,
    limit: Union[Unset, int] = 200,

) -> Optional[Union[HTTPValidationError, PerceptionSignalList]]:
    """ Get Perception Signals

     Polymarket P3 perception signals for a chokepoint (ADR 0037) — anticipation, not evidence.

    The source (`polymarket_gamma`) is uncleared (high license risk), so this endpoint is gated on
    the `read_tainted` scope unconditionally; a plain `read` key gets 403.

    Args:
        chokepoint_id (str):
        limit (Union[Unset, int]):  Default: 200.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, PerceptionSignalList]
     """


    return sync_detailed(
        chokepoint_id=chokepoint_id,
client=client,
limit=limit,

    ).parsed

async def asyncio_detailed(
    chokepoint_id: str,
    *,
    client: AuthenticatedClient,
    limit: Union[Unset, int] = 200,

) -> Response[Union[HTTPValidationError, PerceptionSignalList]]:
    """ Get Perception Signals

     Polymarket P3 perception signals for a chokepoint (ADR 0037) — anticipation, not evidence.

    The source (`polymarket_gamma`) is uncleared (high license risk), so this endpoint is gated on
    the `read_tainted` scope unconditionally; a plain `read` key gets 403.

    Args:
        chokepoint_id (str):
        limit (Union[Unset, int]):  Default: 200.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, PerceptionSignalList]]
     """


    kwargs = _get_kwargs(
        chokepoint_id=chokepoint_id,
limit=limit,

    )

    response = await client.get_async_httpx_client().request(
        **kwargs
    )

    return _build_response(client=client, response=response)

async def asyncio(
    chokepoint_id: str,
    *,
    client: AuthenticatedClient,
    limit: Union[Unset, int] = 200,

) -> Optional[Union[HTTPValidationError, PerceptionSignalList]]:
    """ Get Perception Signals

     Polymarket P3 perception signals for a chokepoint (ADR 0037) — anticipation, not evidence.

    The source (`polymarket_gamma`) is uncleared (high license risk), so this endpoint is gated on
    the `read_tainted` scope unconditionally; a plain `read` key gets 403.

    Args:
        chokepoint_id (str):
        limit (Union[Unset, int]):  Default: 200.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, PerceptionSignalList]
     """


    return (await asyncio_detailed(
        chokepoint_id=chokepoint_id,
client=client,
limit=limit,

    )).parsed
