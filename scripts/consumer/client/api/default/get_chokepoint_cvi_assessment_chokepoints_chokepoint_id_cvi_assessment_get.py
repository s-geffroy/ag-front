from http import HTTPStatus
from typing import Any, Optional, Union, cast

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.cvi_assessment import CviAssessment
from ...models.http_validation_error import HTTPValidationError
from typing import cast



def _get_kwargs(
    chokepoint_id: str,

) -> dict[str, Any]:
    

    

    

    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/chokepoints/{chokepoint_id}/cvi-assessment".format(chokepoint_id=chokepoint_id,),
    }


    return _kwargs


def _parse_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Optional[Union[CviAssessment, HTTPValidationError]]:
    if response.status_code == 200:
        response_200 = CviAssessment.from_dict(response.json())



        return response_200
    if response.status_code == 422:
        response_422 = HTTPValidationError.from_dict(response.json())



        return response_422
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Response[Union[CviAssessment, HTTPValidationError]]:
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

) -> Response[Union[CviAssessment, HTTPValidationError]]:
    """ Get Chokepoint Cvi Assessment

     Corridor Vulnerability Index assessment (8 named dimensions) for this chokepoint (ADR 0055).

    Derived/candidate, never canonical (ADR 0005); scope `read`. Defensively taint-filtered: this
    endpoint
    has NO `include_tainted` and never serves a tainted record, so a restricted chokepoint returns the
    same
    404 as a missing one (existence is not leaked) — even for a `read_tainted` principal. 404 also when
    no
    CVI assessment has been computed for the object. The 0–100 aggregate is gated on a documented
    methodology and is therefore never served (methodology_documented=false; ADR 0049). The candidate
    output
    is served clearly marked (status + verbatim disclaimer).

    Args:
        chokepoint_id (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[CviAssessment, HTTPValidationError]]
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

) -> Optional[Union[CviAssessment, HTTPValidationError]]:
    """ Get Chokepoint Cvi Assessment

     Corridor Vulnerability Index assessment (8 named dimensions) for this chokepoint (ADR 0055).

    Derived/candidate, never canonical (ADR 0005); scope `read`. Defensively taint-filtered: this
    endpoint
    has NO `include_tainted` and never serves a tainted record, so a restricted chokepoint returns the
    same
    404 as a missing one (existence is not leaked) — even for a `read_tainted` principal. 404 also when
    no
    CVI assessment has been computed for the object. The 0–100 aggregate is gated on a documented
    methodology and is therefore never served (methodology_documented=false; ADR 0049). The candidate
    output
    is served clearly marked (status + verbatim disclaimer).

    Args:
        chokepoint_id (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[CviAssessment, HTTPValidationError]
     """


    return sync_detailed(
        chokepoint_id=chokepoint_id,
client=client,

    ).parsed

async def asyncio_detailed(
    chokepoint_id: str,
    *,
    client: AuthenticatedClient,

) -> Response[Union[CviAssessment, HTTPValidationError]]:
    """ Get Chokepoint Cvi Assessment

     Corridor Vulnerability Index assessment (8 named dimensions) for this chokepoint (ADR 0055).

    Derived/candidate, never canonical (ADR 0005); scope `read`. Defensively taint-filtered: this
    endpoint
    has NO `include_tainted` and never serves a tainted record, so a restricted chokepoint returns the
    same
    404 as a missing one (existence is not leaked) — even for a `read_tainted` principal. 404 also when
    no
    CVI assessment has been computed for the object. The 0–100 aggregate is gated on a documented
    methodology and is therefore never served (methodology_documented=false; ADR 0049). The candidate
    output
    is served clearly marked (status + verbatim disclaimer).

    Args:
        chokepoint_id (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[CviAssessment, HTTPValidationError]]
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

) -> Optional[Union[CviAssessment, HTTPValidationError]]:
    """ Get Chokepoint Cvi Assessment

     Corridor Vulnerability Index assessment (8 named dimensions) for this chokepoint (ADR 0055).

    Derived/candidate, never canonical (ADR 0005); scope `read`. Defensively taint-filtered: this
    endpoint
    has NO `include_tainted` and never serves a tainted record, so a restricted chokepoint returns the
    same
    404 as a missing one (existence is not leaked) — even for a `read_tainted` principal. 404 also when
    no
    CVI assessment has been computed for the object. The 0–100 aggregate is gated on a documented
    methodology and is therefore never served (methodology_documented=false; ADR 0049). The candidate
    output
    is served clearly marked (status + verbatim disclaimer).

    Args:
        chokepoint_id (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[CviAssessment, HTTPValidationError]
     """


    return (await asyncio_detailed(
        chokepoint_id=chokepoint_id,
client=client,

    )).parsed
