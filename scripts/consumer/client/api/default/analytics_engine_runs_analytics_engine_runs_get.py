from http import HTTPStatus
from typing import Any, Optional, Union, cast

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.engine_run_out import EngineRunOut
from ...models.http_validation_error import HTTPValidationError
from ...types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union



def _get_kwargs(
    *,
    engine_id: Union[None, Unset, str] = UNSET,

) -> dict[str, Any]:
    

    

    params: dict[str, Any] = {}

    json_engine_id: Union[None, Unset, str]
    if isinstance(engine_id, Unset):
        json_engine_id = UNSET
    else:
        json_engine_id = engine_id
    params["engine_id"] = json_engine_id


    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}


    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/analytics/engine-runs",
        "params": params,
    }


    return _kwargs


def _parse_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Optional[Union[HTTPValidationError, list['EngineRunOut']]]:
    if response.status_code == 200:
        response_200 = []
        _response_200 = response.json()
        for response_200_item_data in (_response_200):
            response_200_item = EngineRunOut.from_dict(response_200_item_data)



            response_200.append(response_200_item)

        return response_200
    if response.status_code == 422:
        response_422 = HTTPValidationError.from_dict(response.json())



        return response_422
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Response[Union[HTTPValidationError, list['EngineRunOut']]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient,
    engine_id: Union[None, Unset, str] = UNSET,

) -> Response[Union[HTTPValidationError, list['EngineRunOut']]]:
    """ Analytics Engine Runs

    Args:
        engine_id (Union[None, Unset, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, list['EngineRunOut']]]
     """


    kwargs = _get_kwargs(
        engine_id=engine_id,

    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)

def sync(
    *,
    client: AuthenticatedClient,
    engine_id: Union[None, Unset, str] = UNSET,

) -> Optional[Union[HTTPValidationError, list['EngineRunOut']]]:
    """ Analytics Engine Runs

    Args:
        engine_id (Union[None, Unset, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, list['EngineRunOut']]
     """


    return sync_detailed(
        client=client,
engine_id=engine_id,

    ).parsed

async def asyncio_detailed(
    *,
    client: AuthenticatedClient,
    engine_id: Union[None, Unset, str] = UNSET,

) -> Response[Union[HTTPValidationError, list['EngineRunOut']]]:
    """ Analytics Engine Runs

    Args:
        engine_id (Union[None, Unset, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, list['EngineRunOut']]]
     """


    kwargs = _get_kwargs(
        engine_id=engine_id,

    )

    response = await client.get_async_httpx_client().request(
        **kwargs
    )

    return _build_response(client=client, response=response)

async def asyncio(
    *,
    client: AuthenticatedClient,
    engine_id: Union[None, Unset, str] = UNSET,

) -> Optional[Union[HTTPValidationError, list['EngineRunOut']]]:
    """ Analytics Engine Runs

    Args:
        engine_id (Union[None, Unset, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, list['EngineRunOut']]
     """


    return (await asyncio_detailed(
        client=client,
engine_id=engine_id,

    )).parsed
