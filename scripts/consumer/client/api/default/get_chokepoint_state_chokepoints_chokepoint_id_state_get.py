from http import HTTPStatus
from typing import Any, Optional, Union, cast

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.chokepoint_state import ChokepointState
from ...models.http_validation_error import HTTPValidationError
from typing import cast



def _get_kwargs(
    chokepoint_id: str,

) -> dict[str, Any]:
    

    

    

    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/chokepoints/{chokepoint_id}/state".format(chokepoint_id=chokepoint_id,),
    }


    return _kwargs


def _parse_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Optional[Union[ChokepointState, HTTPValidationError]]:
    if response.status_code == 200:
        response_200 = ChokepointState.from_dict(response.json())



        return response_200
    if response.status_code == 422:
        response_422 = HTTPValidationError.from_dict(response.json())



        return response_422
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Response[Union[ChokepointState, HTTPValidationError]]:
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

) -> Response[Union[ChokepointState, HTTPValidationError]]:
    r""" Get Chokepoint State

     Current state of this chokepoint — every observable, with its status and its age (ADR 0108).

    Adds no computation: it gathers what the engines already wrote and attaches the freshness verdict.
    Each component is `observed`, `stale` or `no_data`; a component with nothing behind it says so and
    never falls back to a default, because \"no signal\" is not \"calm\".

    Three percentages, served together and meaningless apart — read `coverage_pct` first. `no_data`
    leaves the denominator rather than counting as zero, so an absence can never lower the tension.
    They are NOT comparable between objects (ADR 0049): two objects rest on different components.

    Derived/candidate, never canonical (ADR 0005); scope `read`. Defensively taint-filtered like
    `/cvi-assessment`: a restricted object returns the same 404 as a missing one.

    Args:
        chokepoint_id (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[ChokepointState, HTTPValidationError]]
     """


    kwargs = _get_kwargs(
        chokepoint_id=chokepoint_id,

    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)

def sync(
    chokepoint_id: str,
    *,
    client: AuthenticatedClient,

) -> Optional[Union[ChokepointState, HTTPValidationError]]:
    r""" Get Chokepoint State

     Current state of this chokepoint — every observable, with its status and its age (ADR 0108).

    Adds no computation: it gathers what the engines already wrote and attaches the freshness verdict.
    Each component is `observed`, `stale` or `no_data`; a component with nothing behind it says so and
    never falls back to a default, because \"no signal\" is not \"calm\".

    Three percentages, served together and meaningless apart — read `coverage_pct` first. `no_data`
    leaves the denominator rather than counting as zero, so an absence can never lower the tension.
    They are NOT comparable between objects (ADR 0049): two objects rest on different components.

    Derived/candidate, never canonical (ADR 0005); scope `read`. Defensively taint-filtered like
    `/cvi-assessment`: a restricted object returns the same 404 as a missing one.

    Args:
        chokepoint_id (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[ChokepointState, HTTPValidationError]
     """


    return sync_detailed(
        chokepoint_id=chokepoint_id,
client=client,

    ).parsed

async def asyncio_detailed(
    chokepoint_id: str,
    *,
    client: AuthenticatedClient,

) -> Response[Union[ChokepointState, HTTPValidationError]]:
    r""" Get Chokepoint State

     Current state of this chokepoint — every observable, with its status and its age (ADR 0108).

    Adds no computation: it gathers what the engines already wrote and attaches the freshness verdict.
    Each component is `observed`, `stale` or `no_data`; a component with nothing behind it says so and
    never falls back to a default, because \"no signal\" is not \"calm\".

    Three percentages, served together and meaningless apart — read `coverage_pct` first. `no_data`
    leaves the denominator rather than counting as zero, so an absence can never lower the tension.
    They are NOT comparable between objects (ADR 0049): two objects rest on different components.

    Derived/candidate, never canonical (ADR 0005); scope `read`. Defensively taint-filtered like
    `/cvi-assessment`: a restricted object returns the same 404 as a missing one.

    Args:
        chokepoint_id (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[ChokepointState, HTTPValidationError]]
     """


    kwargs = _get_kwargs(
        chokepoint_id=chokepoint_id,

    )

    response = await client.get_async_httpx_client().request(
        **kwargs
    )

    return _build_response(client=client, response=response)

async def asyncio(
    chokepoint_id: str,
    *,
    client: AuthenticatedClient,

) -> Optional[Union[ChokepointState, HTTPValidationError]]:
    r""" Get Chokepoint State

     Current state of this chokepoint — every observable, with its status and its age (ADR 0108).

    Adds no computation: it gathers what the engines already wrote and attaches the freshness verdict.
    Each component is `observed`, `stale` or `no_data`; a component with nothing behind it says so and
    never falls back to a default, because \"no signal\" is not \"calm\".

    Three percentages, served together and meaningless apart — read `coverage_pct` first. `no_data`
    leaves the denominator rather than counting as zero, so an absence can never lower the tension.
    They are NOT comparable between objects (ADR 0049): two objects rest on different components.

    Derived/candidate, never canonical (ADR 0005); scope `read`. Defensively taint-filtered like
    `/cvi-assessment`: a restricted object returns the same 404 as a missing one.

    Args:
        chokepoint_id (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[ChokepointState, HTTPValidationError]
     """


    return (await asyncio_detailed(
        chokepoint_id=chokepoint_id,
client=client,

    )).parsed
