from http import HTTPStatus
from typing import Any, Optional, Union, cast

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.state_summary_out import StateSummaryOut
from typing import cast



def _get_kwargs(
    
) -> dict[str, Any]:
    

    

    

    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/analytics/state-summary",
    }


    return _kwargs


def _parse_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Optional[StateSummaryOut]:
    if response.status_code == 200:
        response_200 = StateSummaryOut.from_dict(response.json())



        return response_200
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Response[StateSummaryOut]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient,

) -> Response[StateSummaryOut]:
    """ Get State Summary

     How much of the curated core sits above `open` — a count of categories, not a mean (ADR 0108).

    Averaging `tension_pct`, which the contract declares non-comparable between objects, would
    contradict the declaration. This counts regime levels instead, and serves `objects_without_regime`
    beside the share: most of the core has no regime assessment at all, and a share computed over the
    covered few must never be read as a share of the core.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[StateSummaryOut]
     """


    kwargs = _get_kwargs(
        
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)

def sync(
    *,
    client: AuthenticatedClient,

) -> Optional[StateSummaryOut]:
    """ Get State Summary

     How much of the curated core sits above `open` — a count of categories, not a mean (ADR 0108).

    Averaging `tension_pct`, which the contract declares non-comparable between objects, would
    contradict the declaration. This counts regime levels instead, and serves `objects_without_regime`
    beside the share: most of the core has no regime assessment at all, and a share computed over the
    covered few must never be read as a share of the core.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        StateSummaryOut
     """


    return sync_detailed(
        client=client,

    ).parsed

async def asyncio_detailed(
    *,
    client: AuthenticatedClient,

) -> Response[StateSummaryOut]:
    """ Get State Summary

     How much of the curated core sits above `open` — a count of categories, not a mean (ADR 0108).

    Averaging `tension_pct`, which the contract declares non-comparable between objects, would
    contradict the declaration. This counts regime levels instead, and serves `objects_without_regime`
    beside the share: most of the core has no regime assessment at all, and a share computed over the
    covered few must never be read as a share of the core.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[StateSummaryOut]
     """


    kwargs = _get_kwargs(
        
    )

    response = await client.get_async_httpx_client().request(
        **kwargs
    )

    return _build_response(client=client, response=response)

async def asyncio(
    *,
    client: AuthenticatedClient,

) -> Optional[StateSummaryOut]:
    """ Get State Summary

     How much of the curated core sits above `open` — a count of categories, not a mean (ADR 0108).

    Averaging `tension_pct`, which the contract declares non-comparable between objects, would
    contradict the declaration. This counts regime levels instead, and serves `objects_without_regime`
    beside the share: most of the core has no regime assessment at all, and a share computed over the
    covered few must never be read as a share of the core.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        StateSummaryOut
     """


    return (await asyncio_detailed(
        client=client,

    )).parsed
