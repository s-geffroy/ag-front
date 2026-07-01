from http import HTTPStatus
from typing import Any, Optional, Union, cast

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.event_signal_out import EventSignalOut
from ...models.http_validation_error import HTTPValidationError
from ...types import UNSET, Unset
from typing import cast
from typing import Union



def _get_kwargs(
    chokepoint_id: str,
    *,
    include_tainted: Union[Unset, bool] = False,
    limit: Union[Unset, int] = 500,

) -> dict[str, Any]:
    

    

    params: dict[str, Any] = {}

    params["include_tainted"] = include_tainted

    params["limit"] = limit


    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}


    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/chokepoints/{chokepoint_id}/event-signals".format(chokepoint_id=chokepoint_id,),
        "params": params,
    }


    return _kwargs


def _parse_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Optional[Union[HTTPValidationError, list['EventSignalOut']]]:
    if response.status_code == 200:
        response_200 = []
        _response_200 = response.json()
        for response_200_item_data in (_response_200):
            response_200_item = EventSignalOut.from_dict(response_200_item_data)



            response_200.append(response_200_item)

        return response_200
    if response.status_code == 422:
        response_422 = HTTPValidationError.from_dict(response.json())



        return response_422
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Response[Union[HTTPValidationError, list['EventSignalOut']]]:
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
    include_tainted: Union[Unset, bool] = False,
    limit: Union[Unset, int] = 500,

) -> Response[Union[HTTPValidationError, list['EventSignalOut']]]:
    """ Get Chokepoint Event Signals

     Raw append-only event-signal stream for this chokepoint (USGS hazards + GDELT media, ADR 0042).
    The aggregated view is the event_pressure result in /chokepoints/{id}/analysis.

    Args:
        chokepoint_id (str):
        include_tainted (Union[Unset, bool]):  Default: False.
        limit (Union[Unset, int]):  Default: 500.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, list['EventSignalOut']]]
     """


    kwargs = _get_kwargs(
        chokepoint_id=chokepoint_id,
include_tainted=include_tainted,
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
    include_tainted: Union[Unset, bool] = False,
    limit: Union[Unset, int] = 500,

) -> Optional[Union[HTTPValidationError, list['EventSignalOut']]]:
    """ Get Chokepoint Event Signals

     Raw append-only event-signal stream for this chokepoint (USGS hazards + GDELT media, ADR 0042).
    The aggregated view is the event_pressure result in /chokepoints/{id}/analysis.

    Args:
        chokepoint_id (str):
        include_tainted (Union[Unset, bool]):  Default: False.
        limit (Union[Unset, int]):  Default: 500.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, list['EventSignalOut']]
     """


    return sync_detailed(
        chokepoint_id=chokepoint_id,
client=client,
include_tainted=include_tainted,
limit=limit,

    ).parsed

async def asyncio_detailed(
    chokepoint_id: str,
    *,
    client: AuthenticatedClient,
    include_tainted: Union[Unset, bool] = False,
    limit: Union[Unset, int] = 500,

) -> Response[Union[HTTPValidationError, list['EventSignalOut']]]:
    """ Get Chokepoint Event Signals

     Raw append-only event-signal stream for this chokepoint (USGS hazards + GDELT media, ADR 0042).
    The aggregated view is the event_pressure result in /chokepoints/{id}/analysis.

    Args:
        chokepoint_id (str):
        include_tainted (Union[Unset, bool]):  Default: False.
        limit (Union[Unset, int]):  Default: 500.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, list['EventSignalOut']]]
     """


    kwargs = _get_kwargs(
        chokepoint_id=chokepoint_id,
include_tainted=include_tainted,
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
    include_tainted: Union[Unset, bool] = False,
    limit: Union[Unset, int] = 500,

) -> Optional[Union[HTTPValidationError, list['EventSignalOut']]]:
    """ Get Chokepoint Event Signals

     Raw append-only event-signal stream for this chokepoint (USGS hazards + GDELT media, ADR 0042).
    The aggregated view is the event_pressure result in /chokepoints/{id}/analysis.

    Args:
        chokepoint_id (str):
        include_tainted (Union[Unset, bool]):  Default: False.
        limit (Union[Unset, int]):  Default: 500.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, list['EventSignalOut']]
     """


    return (await asyncio_detailed(
        chokepoint_id=chokepoint_id,
client=client,
include_tainted=include_tainted,
limit=limit,

    )).parsed
