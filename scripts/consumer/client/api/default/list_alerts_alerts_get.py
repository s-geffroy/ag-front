from http import HTTPStatus
from typing import Any, Optional, Union, cast

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.alert_out import AlertOut
from ...models.http_validation_error import HTTPValidationError
from ...types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union



def _get_kwargs(
    *,
    include_tainted: Union[Unset, bool] = False,
    review_status: Union[None, Unset, str] = UNSET,
    chokepoint_id: Union[None, Unset, str] = UNSET,
    limit: Union[Unset, int] = 500,

) -> dict[str, Any]:
    

    

    params: dict[str, Any] = {}

    params["include_tainted"] = include_tainted

    json_review_status: Union[None, Unset, str]
    if isinstance(review_status, Unset):
        json_review_status = UNSET
    else:
        json_review_status = review_status
    params["review_status"] = json_review_status

    json_chokepoint_id: Union[None, Unset, str]
    if isinstance(chokepoint_id, Unset):
        json_chokepoint_id = UNSET
    else:
        json_chokepoint_id = chokepoint_id
    params["chokepoint_id"] = json_chokepoint_id

    params["limit"] = limit


    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}


    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/alerts",
        "params": params,
    }


    return _kwargs


def _parse_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Optional[Union[HTTPValidationError, list['AlertOut']]]:
    if response.status_code == 200:
        response_200 = []
        _response_200 = response.json()
        for response_200_item_data in (_response_200):
            response_200_item = AlertOut.from_dict(response_200_item_data)



            response_200.append(response_200_item)

        return response_200
    if response.status_code == 422:
        response_422 = HTTPValidationError.from_dict(response.json())



        return response_422
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Response[Union[HTTPValidationError, list['AlertOut']]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient,
    include_tainted: Union[Unset, bool] = False,
    review_status: Union[None, Unset, str] = UNSET,
    chokepoint_id: Union[None, Unset, str] = UNSET,
    limit: Union[Unset, int] = 500,

) -> Response[Union[HTTPValidationError, list['AlertOut']]]:
    """ List Alerts

     Analytical alerts (ADR 0047). An alert is a trigger for review, not a conclusion. Live alerts
    (open/acknowledged) by default; pass review_status to filter. Tainted chokepoints are excluded
    unless include_tainted + scope.

    Args:
        include_tainted (Union[Unset, bool]):  Default: False.
        review_status (Union[None, Unset, str]): filter by review_status
        chokepoint_id (Union[None, Unset, str]):
        limit (Union[Unset, int]):  Default: 500.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, list['AlertOut']]]
     """


    kwargs = _get_kwargs(
        include_tainted=include_tainted,
review_status=review_status,
chokepoint_id=chokepoint_id,
limit=limit,

    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)

def sync(
    *,
    client: AuthenticatedClient,
    include_tainted: Union[Unset, bool] = False,
    review_status: Union[None, Unset, str] = UNSET,
    chokepoint_id: Union[None, Unset, str] = UNSET,
    limit: Union[Unset, int] = 500,

) -> Optional[Union[HTTPValidationError, list['AlertOut']]]:
    """ List Alerts

     Analytical alerts (ADR 0047). An alert is a trigger for review, not a conclusion. Live alerts
    (open/acknowledged) by default; pass review_status to filter. Tainted chokepoints are excluded
    unless include_tainted + scope.

    Args:
        include_tainted (Union[Unset, bool]):  Default: False.
        review_status (Union[None, Unset, str]): filter by review_status
        chokepoint_id (Union[None, Unset, str]):
        limit (Union[Unset, int]):  Default: 500.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, list['AlertOut']]
     """


    return sync_detailed(
        client=client,
include_tainted=include_tainted,
review_status=review_status,
chokepoint_id=chokepoint_id,
limit=limit,

    ).parsed

async def asyncio_detailed(
    *,
    client: AuthenticatedClient,
    include_tainted: Union[Unset, bool] = False,
    review_status: Union[None, Unset, str] = UNSET,
    chokepoint_id: Union[None, Unset, str] = UNSET,
    limit: Union[Unset, int] = 500,

) -> Response[Union[HTTPValidationError, list['AlertOut']]]:
    """ List Alerts

     Analytical alerts (ADR 0047). An alert is a trigger for review, not a conclusion. Live alerts
    (open/acknowledged) by default; pass review_status to filter. Tainted chokepoints are excluded
    unless include_tainted + scope.

    Args:
        include_tainted (Union[Unset, bool]):  Default: False.
        review_status (Union[None, Unset, str]): filter by review_status
        chokepoint_id (Union[None, Unset, str]):
        limit (Union[Unset, int]):  Default: 500.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, list['AlertOut']]]
     """


    kwargs = _get_kwargs(
        include_tainted=include_tainted,
review_status=review_status,
chokepoint_id=chokepoint_id,
limit=limit,

    )

    response = await client.get_async_httpx_client().request(
        **kwargs
    )

    return _build_response(client=client, response=response)

async def asyncio(
    *,
    client: AuthenticatedClient,
    include_tainted: Union[Unset, bool] = False,
    review_status: Union[None, Unset, str] = UNSET,
    chokepoint_id: Union[None, Unset, str] = UNSET,
    limit: Union[Unset, int] = 500,

) -> Optional[Union[HTTPValidationError, list['AlertOut']]]:
    """ List Alerts

     Analytical alerts (ADR 0047). An alert is a trigger for review, not a conclusion. Live alerts
    (open/acknowledged) by default; pass review_status to filter. Tainted chokepoints are excluded
    unless include_tainted + scope.

    Args:
        include_tainted (Union[Unset, bool]):  Default: False.
        review_status (Union[None, Unset, str]): filter by review_status
        chokepoint_id (Union[None, Unset, str]):
        limit (Union[Unset, int]):  Default: 500.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, list['AlertOut']]
     """


    return (await asyncio_detailed(
        client=client,
include_tainted=include_tainted,
review_status=review_status,
chokepoint_id=chokepoint_id,
limit=limit,

    )).parsed
