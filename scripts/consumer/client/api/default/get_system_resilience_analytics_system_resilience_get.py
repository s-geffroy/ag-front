from http import HTTPStatus
from typing import Any, Optional, Union, cast

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.system_resilience_out import SystemResilienceOut
from typing import cast



def _get_kwargs(
    
) -> dict[str, Any]:
    

    

    

    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/analytics/system-resilience",
    }


    return _kwargs


def _parse_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Optional[SystemResilienceOut]:
    if response.status_code == 200:
        response_200 = SystemResilienceOut.from_dict(response.json())



        return response_200
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Response[SystemResilienceOut]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient,

) -> Response[SystemResilienceOut]:
    """ Get System Resilience

     System resilience via Ecological Network Analysis over the WHOLE systemic relation graph
    (engine `system_resilience`, ADR 0057).

    Derived/candidate, never canonical (ADR 0005); scope `read`. This engine emits a single global row
    (`object_id='GLOBAL'`) over the entire relation graph rather than a per-object result, so it is
    served here rather than in the per-chokepoint /analysis. 404 if no resilience result has been
    computed yet (e.g. degenerate graph). Latest snapshot only.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[SystemResilienceOut]
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

) -> Optional[SystemResilienceOut]:
    """ Get System Resilience

     System resilience via Ecological Network Analysis over the WHOLE systemic relation graph
    (engine `system_resilience`, ADR 0057).

    Derived/candidate, never canonical (ADR 0005); scope `read`. This engine emits a single global row
    (`object_id='GLOBAL'`) over the entire relation graph rather than a per-object result, so it is
    served here rather than in the per-chokepoint /analysis. 404 if no resilience result has been
    computed yet (e.g. degenerate graph). Latest snapshot only.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        SystemResilienceOut
     """


    return sync_detailed(
        client=client,

    ).parsed

async def asyncio_detailed(
    *,
    client: AuthenticatedClient,

) -> Response[SystemResilienceOut]:
    """ Get System Resilience

     System resilience via Ecological Network Analysis over the WHOLE systemic relation graph
    (engine `system_resilience`, ADR 0057).

    Derived/candidate, never canonical (ADR 0005); scope `read`. This engine emits a single global row
    (`object_id='GLOBAL'`) over the entire relation graph rather than a per-object result, so it is
    served here rather than in the per-chokepoint /analysis. 404 if no resilience result has been
    computed yet (e.g. degenerate graph). Latest snapshot only.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[SystemResilienceOut]
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

) -> Optional[SystemResilienceOut]:
    """ Get System Resilience

     System resilience via Ecological Network Analysis over the WHOLE systemic relation graph
    (engine `system_resilience`, ADR 0057).

    Derived/candidate, never canonical (ADR 0005); scope `read`. This engine emits a single global row
    (`object_id='GLOBAL'`) over the entire relation graph rather than a per-object result, so it is
    served here rather than in the per-chokepoint /analysis. 404 if no resilience result has been
    computed yet (e.g. degenerate graph). Latest snapshot only.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        SystemResilienceOut
     """


    return (await asyncio_detailed(
        client=client,

    )).parsed
