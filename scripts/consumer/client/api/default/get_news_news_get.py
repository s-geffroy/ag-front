from http import HTTPStatus
from typing import Any, Optional, Union, cast

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.http_validation_error import HTTPValidationError
from ...models.news_feed_out import NewsFeedOut
from ...types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union



def _get_kwargs(
    *,
    since: Union[Unset, int] = 7,
    limit: Union[Unset, int] = 50,
    chokepoint_id: Union[None, Unset, str] = UNSET,
    category: Union[None, Unset, str] = UNSET,
    include_tainted: Union[Unset, bool] = False,

) -> dict[str, Any]:
    

    

    params: dict[str, Any] = {}

    params["since"] = since

    params["limit"] = limit

    json_chokepoint_id: Union[None, Unset, str]
    if isinstance(chokepoint_id, Unset):
        json_chokepoint_id = UNSET
    else:
        json_chokepoint_id = chokepoint_id
    params["chokepoint_id"] = json_chokepoint_id

    json_category: Union[None, Unset, str]
    if isinstance(category, Unset):
        json_category = UNSET
    else:
        json_category = category
    params["category"] = json_category

    params["include_tainted"] = include_tainted


    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}


    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/news",
        "params": params,
    }


    return _kwargs


def _parse_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Optional[Union[HTTPValidationError, NewsFeedOut]]:
    if response.status_code == 200:
        response_200 = NewsFeedOut.from_dict(response.json())



        return response_200
    if response.status_code == 422:
        response_422 = HTTPValidationError.from_dict(response.json())



        return response_422
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Response[Union[HTTPValidationError, NewsFeedOut]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient,
    since: Union[Unset, int] = 7,
    limit: Union[Unset, int] = 50,
    chokepoint_id: Union[None, Unset, str] = UNSET,
    category: Union[None, Unset, str] = UNSET,
    include_tainted: Union[Unset, bool] = False,

) -> Response[Union[HTTPValidationError, NewsFeedOut]]:
    """ Get News

     Live chokepoint news — media articles grouped by event and summarised (ADR 0076).

    Serves the latest aggregation run THAT PRODUCED CLUSTERS (runs every 6h; older snapshots are swept
    at 14 days and are always rebuildable from observations.event_signal, which is append-only). The
    distinction matters: a pass that clusters nothing — an offline façade, a model outage — writes no
    `news_cluster` row, so this keeps serving the previous run rather than emptying the feed. That is
    deliberate, and it is legible rather than hidden: `run_id` and `generated_at` in the envelope name
    exactly which pass the reader is holding and how old it is. Derived and candidate: press coverage is
    news context, never proof of a closure.

    Args:
        since (Union[Unset, int]): Days back. Values above the aggregator's own collection window
            cannot return more: one run is served and that run never saw older signals. The window
            actually applied is reported as `since_days_effective` rather than silently substituted.
            Default: 7.
        limit (Union[Unset, int]):  Default: 50.
        chokepoint_id (Union[None, Unset, str]):
        category (Union[None, Unset, str]):
        include_tainted (Union[Unset, bool]):  Default: False.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, NewsFeedOut]]
     """


    kwargs = _get_kwargs(
        since=since,
limit=limit,
chokepoint_id=chokepoint_id,
category=category,
include_tainted=include_tainted,

    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)

def sync(
    *,
    client: AuthenticatedClient,
    since: Union[Unset, int] = 7,
    limit: Union[Unset, int] = 50,
    chokepoint_id: Union[None, Unset, str] = UNSET,
    category: Union[None, Unset, str] = UNSET,
    include_tainted: Union[Unset, bool] = False,

) -> Optional[Union[HTTPValidationError, NewsFeedOut]]:
    """ Get News

     Live chokepoint news — media articles grouped by event and summarised (ADR 0076).

    Serves the latest aggregation run THAT PRODUCED CLUSTERS (runs every 6h; older snapshots are swept
    at 14 days and are always rebuildable from observations.event_signal, which is append-only). The
    distinction matters: a pass that clusters nothing — an offline façade, a model outage — writes no
    `news_cluster` row, so this keeps serving the previous run rather than emptying the feed. That is
    deliberate, and it is legible rather than hidden: `run_id` and `generated_at` in the envelope name
    exactly which pass the reader is holding and how old it is. Derived and candidate: press coverage is
    news context, never proof of a closure.

    Args:
        since (Union[Unset, int]): Days back. Values above the aggregator's own collection window
            cannot return more: one run is served and that run never saw older signals. The window
            actually applied is reported as `since_days_effective` rather than silently substituted.
            Default: 7.
        limit (Union[Unset, int]):  Default: 50.
        chokepoint_id (Union[None, Unset, str]):
        category (Union[None, Unset, str]):
        include_tainted (Union[Unset, bool]):  Default: False.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, NewsFeedOut]
     """


    return sync_detailed(
        client=client,
since=since,
limit=limit,
chokepoint_id=chokepoint_id,
category=category,
include_tainted=include_tainted,

    ).parsed

async def asyncio_detailed(
    *,
    client: AuthenticatedClient,
    since: Union[Unset, int] = 7,
    limit: Union[Unset, int] = 50,
    chokepoint_id: Union[None, Unset, str] = UNSET,
    category: Union[None, Unset, str] = UNSET,
    include_tainted: Union[Unset, bool] = False,

) -> Response[Union[HTTPValidationError, NewsFeedOut]]:
    """ Get News

     Live chokepoint news — media articles grouped by event and summarised (ADR 0076).

    Serves the latest aggregation run THAT PRODUCED CLUSTERS (runs every 6h; older snapshots are swept
    at 14 days and are always rebuildable from observations.event_signal, which is append-only). The
    distinction matters: a pass that clusters nothing — an offline façade, a model outage — writes no
    `news_cluster` row, so this keeps serving the previous run rather than emptying the feed. That is
    deliberate, and it is legible rather than hidden: `run_id` and `generated_at` in the envelope name
    exactly which pass the reader is holding and how old it is. Derived and candidate: press coverage is
    news context, never proof of a closure.

    Args:
        since (Union[Unset, int]): Days back. Values above the aggregator's own collection window
            cannot return more: one run is served and that run never saw older signals. The window
            actually applied is reported as `since_days_effective` rather than silently substituted.
            Default: 7.
        limit (Union[Unset, int]):  Default: 50.
        chokepoint_id (Union[None, Unset, str]):
        category (Union[None, Unset, str]):
        include_tainted (Union[Unset, bool]):  Default: False.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, NewsFeedOut]]
     """


    kwargs = _get_kwargs(
        since=since,
limit=limit,
chokepoint_id=chokepoint_id,
category=category,
include_tainted=include_tainted,

    )

    response = await client.get_async_httpx_client().request(
        **kwargs
    )

    return _build_response(client=client, response=response)

async def asyncio(
    *,
    client: AuthenticatedClient,
    since: Union[Unset, int] = 7,
    limit: Union[Unset, int] = 50,
    chokepoint_id: Union[None, Unset, str] = UNSET,
    category: Union[None, Unset, str] = UNSET,
    include_tainted: Union[Unset, bool] = False,

) -> Optional[Union[HTTPValidationError, NewsFeedOut]]:
    """ Get News

     Live chokepoint news — media articles grouped by event and summarised (ADR 0076).

    Serves the latest aggregation run THAT PRODUCED CLUSTERS (runs every 6h; older snapshots are swept
    at 14 days and are always rebuildable from observations.event_signal, which is append-only). The
    distinction matters: a pass that clusters nothing — an offline façade, a model outage — writes no
    `news_cluster` row, so this keeps serving the previous run rather than emptying the feed. That is
    deliberate, and it is legible rather than hidden: `run_id` and `generated_at` in the envelope name
    exactly which pass the reader is holding and how old it is. Derived and candidate: press coverage is
    news context, never proof of a closure.

    Args:
        since (Union[Unset, int]): Days back. Values above the aggregator's own collection window
            cannot return more: one run is served and that run never saw older signals. The window
            actually applied is reported as `since_days_effective` rather than silently substituted.
            Default: 7.
        limit (Union[Unset, int]):  Default: 50.
        chokepoint_id (Union[None, Unset, str]):
        category (Union[None, Unset, str]):
        include_tainted (Union[Unset, bool]):  Default: False.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, NewsFeedOut]
     """


    return (await asyncio_detailed(
        client=client,
since=since,
limit=limit,
chokepoint_id=chokepoint_id,
category=category,
include_tainted=include_tainted,

    )).parsed
