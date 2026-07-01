from http import HTTPStatus
from typing import Any, Optional, Union, cast

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.chokepoint_list import ChokepointList
from ...models.http_validation_error import HTTPValidationError
from ...types import UNSET, Unset
from typing import cast
from typing import Union



def _get_kwargs(
    *,
    lat: float,
    lon: float,
    radius_km: Union[Unset, float] = 500.0,
    include_tainted: Union[Unset, bool] = False,
    limit: Union[Unset, int] = 50,

) -> dict[str, Any]:
    

    

    params: dict[str, Any] = {}

    params["lat"] = lat

    params["lon"] = lon

    params["radius_km"] = radius_km

    params["include_tainted"] = include_tainted

    params["limit"] = limit


    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}


    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/chokepoints/nearby",
        "params": params,
    }


    return _kwargs


def _parse_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Optional[Union[ChokepointList, HTTPValidationError]]:
    if response.status_code == 200:
        response_200 = ChokepointList.from_dict(response.json())



        return response_200
    if response.status_code == 422:
        response_422 = HTTPValidationError.from_dict(response.json())



        return response_422
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Response[Union[ChokepointList, HTTPValidationError]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient,
    lat: float,
    lon: float,
    radius_km: Union[Unset, float] = 500.0,
    include_tainted: Union[Unset, bool] = False,
    limit: Union[Unset, int] = 50,

) -> Response[Union[ChokepointList, HTTPValidationError]]:
    """ Nearby Chokepoints

     Spatial proximity on the SCHEMATIC display_point — not navigational truth.

    Args:
        lat (float):
        lon (float):
        radius_km (Union[Unset, float]):  Default: 500.0.
        include_tainted (Union[Unset, bool]):  Default: False.
        limit (Union[Unset, int]):  Default: 50.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[ChokepointList, HTTPValidationError]]
     """


    kwargs = _get_kwargs(
        lat=lat,
lon=lon,
radius_km=radius_km,
include_tainted=include_tainted,
limit=limit,

    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)

def sync(
    *,
    client: AuthenticatedClient,
    lat: float,
    lon: float,
    radius_km: Union[Unset, float] = 500.0,
    include_tainted: Union[Unset, bool] = False,
    limit: Union[Unset, int] = 50,

) -> Optional[Union[ChokepointList, HTTPValidationError]]:
    """ Nearby Chokepoints

     Spatial proximity on the SCHEMATIC display_point — not navigational truth.

    Args:
        lat (float):
        lon (float):
        radius_km (Union[Unset, float]):  Default: 500.0.
        include_tainted (Union[Unset, bool]):  Default: False.
        limit (Union[Unset, int]):  Default: 50.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[ChokepointList, HTTPValidationError]
     """


    return sync_detailed(
        client=client,
lat=lat,
lon=lon,
radius_km=radius_km,
include_tainted=include_tainted,
limit=limit,

    ).parsed

async def asyncio_detailed(
    *,
    client: AuthenticatedClient,
    lat: float,
    lon: float,
    radius_km: Union[Unset, float] = 500.0,
    include_tainted: Union[Unset, bool] = False,
    limit: Union[Unset, int] = 50,

) -> Response[Union[ChokepointList, HTTPValidationError]]:
    """ Nearby Chokepoints

     Spatial proximity on the SCHEMATIC display_point — not navigational truth.

    Args:
        lat (float):
        lon (float):
        radius_km (Union[Unset, float]):  Default: 500.0.
        include_tainted (Union[Unset, bool]):  Default: False.
        limit (Union[Unset, int]):  Default: 50.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[ChokepointList, HTTPValidationError]]
     """


    kwargs = _get_kwargs(
        lat=lat,
lon=lon,
radius_km=radius_km,
include_tainted=include_tainted,
limit=limit,

    )

    response = await client.get_async_httpx_client().request(
        **kwargs
    )

    return _build_response(client=client, response=response)

async def asyncio(
    *,
    client: AuthenticatedClient,
    lat: float,
    lon: float,
    radius_km: Union[Unset, float] = 500.0,
    include_tainted: Union[Unset, bool] = False,
    limit: Union[Unset, int] = 50,

) -> Optional[Union[ChokepointList, HTTPValidationError]]:
    """ Nearby Chokepoints

     Spatial proximity on the SCHEMATIC display_point — not navigational truth.

    Args:
        lat (float):
        lon (float):
        radius_km (Union[Unset, float]):  Default: 500.0.
        include_tainted (Union[Unset, bool]):  Default: False.
        limit (Union[Unset, int]):  Default: 50.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[ChokepointList, HTTPValidationError]
     """


    return (await asyncio_detailed(
        client=client,
lat=lat,
lon=lon,
radius_km=radius_km,
include_tainted=include_tainted,
limit=limit,

    )).parsed
