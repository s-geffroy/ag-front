from http import HTTPStatus
from typing import Any, Optional, Union, cast

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.http_validation_error import HTTPValidationError
from ...models.risk_chokepoint_out import RiskChokepointOut
from ...types import UNSET, Unset
from typing import cast
from typing import Union



def _get_kwargs(
    risk_type: str,
    *,
    include_tainted: Union[Unset, bool] = False,

) -> dict[str, Any]:
    

    

    params: dict[str, Any] = {}

    params["include_tainted"] = include_tainted


    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}


    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/chokepoints/by-risk/{risk_type}".format(risk_type=risk_type,),
        "params": params,
    }


    return _kwargs


def _parse_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Optional[Union[HTTPValidationError, list['RiskChokepointOut']]]:
    if response.status_code == 200:
        response_200 = []
        _response_200 = response.json()
        for response_200_item_data in (_response_200):
            response_200_item = RiskChokepointOut.from_dict(response_200_item_data)



            response_200.append(response_200_item)

        return response_200
    if response.status_code == 422:
        response_422 = HTTPValidationError.from_dict(response.json())



        return response_422
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Response[Union[HTTPValidationError, list['RiskChokepointOut']]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    risk_type: str,
    *,
    client: AuthenticatedClient,
    include_tainted: Union[Unset, bool] = False,

) -> Response[Union[HTTPValidationError, list['RiskChokepointOut']]]:
    """ Chokepoints By Risk

    Args:
        risk_type (str):
        include_tainted (Union[Unset, bool]):  Default: False.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, list['RiskChokepointOut']]]
     """


    kwargs = _get_kwargs(
        risk_type=risk_type,
include_tainted=include_tainted,

    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)

def sync(
    risk_type: str,
    *,
    client: AuthenticatedClient,
    include_tainted: Union[Unset, bool] = False,

) -> Optional[Union[HTTPValidationError, list['RiskChokepointOut']]]:
    """ Chokepoints By Risk

    Args:
        risk_type (str):
        include_tainted (Union[Unset, bool]):  Default: False.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, list['RiskChokepointOut']]
     """


    return sync_detailed(
        risk_type=risk_type,
client=client,
include_tainted=include_tainted,

    ).parsed

async def asyncio_detailed(
    risk_type: str,
    *,
    client: AuthenticatedClient,
    include_tainted: Union[Unset, bool] = False,

) -> Response[Union[HTTPValidationError, list['RiskChokepointOut']]]:
    """ Chokepoints By Risk

    Args:
        risk_type (str):
        include_tainted (Union[Unset, bool]):  Default: False.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, list['RiskChokepointOut']]]
     """


    kwargs = _get_kwargs(
        risk_type=risk_type,
include_tainted=include_tainted,

    )

    response = await client.get_async_httpx_client().request(
        **kwargs
    )

    return _build_response(client=client, response=response)

async def asyncio(
    risk_type: str,
    *,
    client: AuthenticatedClient,
    include_tainted: Union[Unset, bool] = False,

) -> Optional[Union[HTTPValidationError, list['RiskChokepointOut']]]:
    """ Chokepoints By Risk

    Args:
        risk_type (str):
        include_tainted (Union[Unset, bool]):  Default: False.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, list['RiskChokepointOut']]
     """


    return (await asyncio_detailed(
        risk_type=risk_type,
client=client,
include_tainted=include_tainted,

    )).parsed
