from http import HTTPStatus
from typing import Any, Optional, Union, cast

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.http_validation_error import HTTPValidationError
from ...models.prediction_consensus_list import PredictionConsensusList
from typing import cast



def _get_kwargs(
    chokepoint_id: str,

) -> dict[str, Any]:
    

    

    

    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/chokepoints/{chokepoint_id}/prediction-consensus".format(chokepoint_id=chokepoint_id,),
    }


    return _kwargs


def _parse_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Optional[Union[HTTPValidationError, PredictionConsensusList]]:
    if response.status_code == 200:
        response_200 = PredictionConsensusList.from_dict(response.json())



        return response_200
    if response.status_code == 422:
        response_422 = HTTPValidationError.from_dict(response.json())



        return response_422
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Response[Union[HTTPValidationError, PredictionConsensusList]]:
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

) -> Response[Union[HTTPValidationError, PredictionConsensusList]]:
    """ Get Prediction Consensus

     Derived Polymarket P3 consensus for one chokepoint at the CLEAR `read` token — the narrow,
    redistributable surface (with Polymarket attribution, S5 low-reliability). Floored on ADR 0079:
    only objects a market names/implies return rows, so an object with no honest coverage yields an
    empty list (200, not 404). Raw markets stay at `/perception-signals` (read_tainted).

    Args:
        chokepoint_id (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, PredictionConsensusList]]
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

) -> Optional[Union[HTTPValidationError, PredictionConsensusList]]:
    """ Get Prediction Consensus

     Derived Polymarket P3 consensus for one chokepoint at the CLEAR `read` token — the narrow,
    redistributable surface (with Polymarket attribution, S5 low-reliability). Floored on ADR 0079:
    only objects a market names/implies return rows, so an object with no honest coverage yields an
    empty list (200, not 404). Raw markets stay at `/perception-signals` (read_tainted).

    Args:
        chokepoint_id (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, PredictionConsensusList]
     """


    return sync_detailed(
        chokepoint_id=chokepoint_id,
client=client,

    ).parsed

async def asyncio_detailed(
    chokepoint_id: str,
    *,
    client: AuthenticatedClient,

) -> Response[Union[HTTPValidationError, PredictionConsensusList]]:
    """ Get Prediction Consensus

     Derived Polymarket P3 consensus for one chokepoint at the CLEAR `read` token — the narrow,
    redistributable surface (with Polymarket attribution, S5 low-reliability). Floored on ADR 0079:
    only objects a market names/implies return rows, so an object with no honest coverage yields an
    empty list (200, not 404). Raw markets stay at `/perception-signals` (read_tainted).

    Args:
        chokepoint_id (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, PredictionConsensusList]]
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

) -> Optional[Union[HTTPValidationError, PredictionConsensusList]]:
    """ Get Prediction Consensus

     Derived Polymarket P3 consensus for one chokepoint at the CLEAR `read` token — the narrow,
    redistributable surface (with Polymarket attribution, S5 low-reliability). Floored on ADR 0079:
    only objects a market names/implies return rows, so an object with no honest coverage yields an
    empty list (200, not 404). Raw markets stay at `/perception-signals` (read_tainted).

    Args:
        chokepoint_id (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, PredictionConsensusList]
     """


    return (await asyncio_detailed(
        chokepoint_id=chokepoint_id,
client=client,

    )).parsed
