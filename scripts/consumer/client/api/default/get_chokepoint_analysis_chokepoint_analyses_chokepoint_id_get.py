from http import HTTPStatus
from typing import Any, Optional, Union, cast

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.chokepoint_analysis_detail import ChokepointAnalysisDetail
from ...models.http_validation_error import HTTPValidationError
from typing import cast



def _get_kwargs(
    chokepoint_id: str,

) -> dict[str, Any]:
    

    

    

    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/chokepoint-analyses/{chokepoint_id}".format(chokepoint_id=chokepoint_id,),
    }


    return _kwargs


def _parse_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Optional[Union[ChokepointAnalysisDetail, HTTPValidationError]]:
    if response.status_code == 200:
        response_200 = ChokepointAnalysisDetail.from_dict(response.json())



        return response_200
    if response.status_code == 422:
        response_422 = HTTPValidationError.from_dict(response.json())



        return response_422
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Response[Union[ChokepointAnalysisDetail, HTTPValidationError]]:
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

) -> Response[Union[ChokepointAnalysisDetail, HTTPValidationError]]:
    """ Get Chokepoint Analysis

     Full derived analysis (synthesis + ToC + Leverage Points) for one chokepoint.

    Args:
        chokepoint_id (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[ChokepointAnalysisDetail, HTTPValidationError]]
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

) -> Optional[Union[ChokepointAnalysisDetail, HTTPValidationError]]:
    """ Get Chokepoint Analysis

     Full derived analysis (synthesis + ToC + Leverage Points) for one chokepoint.

    Args:
        chokepoint_id (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[ChokepointAnalysisDetail, HTTPValidationError]
     """


    return sync_detailed(
        chokepoint_id=chokepoint_id,
client=client,

    ).parsed

async def asyncio_detailed(
    chokepoint_id: str,
    *,
    client: AuthenticatedClient,

) -> Response[Union[ChokepointAnalysisDetail, HTTPValidationError]]:
    """ Get Chokepoint Analysis

     Full derived analysis (synthesis + ToC + Leverage Points) for one chokepoint.

    Args:
        chokepoint_id (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[ChokepointAnalysisDetail, HTTPValidationError]]
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

) -> Optional[Union[ChokepointAnalysisDetail, HTTPValidationError]]:
    """ Get Chokepoint Analysis

     Full derived analysis (synthesis + ToC + Leverage Points) for one chokepoint.

    Args:
        chokepoint_id (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[ChokepointAnalysisDetail, HTTPValidationError]
     """


    return (await asyncio_detailed(
        chokepoint_id=chokepoint_id,
client=client,

    )).parsed
