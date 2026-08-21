from http import HTTPStatus
from typing import Any, Optional, Union, cast

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.derived_relation_graph_out import DerivedRelationGraphOut
from ...models.http_validation_error import HTTPValidationError
from ...types import UNSET, Unset
from typing import cast
from typing import cast, Union
from typing import Union



def _get_kwargs(
    *,
    relation_type: Union[None, Unset, str] = UNSET,
    from_object_id: Union[None, Unset, str] = UNSET,
    origin: Union[None, Unset, str] = UNSET,
    to_status: Union[None, Unset, str] = UNSET,
    limit: Union[Unset, int] = 1000,

) -> dict[str, Any]:
    

    

    params: dict[str, Any] = {}

    json_relation_type: Union[None, Unset, str]
    if isinstance(relation_type, Unset):
        json_relation_type = UNSET
    else:
        json_relation_type = relation_type
    params["relation_type"] = json_relation_type

    json_from_object_id: Union[None, Unset, str]
    if isinstance(from_object_id, Unset):
        json_from_object_id = UNSET
    else:
        json_from_object_id = from_object_id
    params["from_object_id"] = json_from_object_id

    json_origin: Union[None, Unset, str]
    if isinstance(origin, Unset):
        json_origin = UNSET
    else:
        json_origin = origin
    params["origin"] = json_origin

    json_to_status: Union[None, Unset, str]
    if isinstance(to_status, Unset):
        json_to_status = UNSET
    else:
        json_to_status = to_status
    params["to_status"] = json_to_status

    params["limit"] = limit


    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}


    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/derived/relations",
        "params": params,
    }


    return _kwargs


def _parse_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Optional[Union[DerivedRelationGraphOut, HTTPValidationError]]:
    if response.status_code == 200:
        response_200 = DerivedRelationGraphOut.from_dict(response.json())



        return response_200
    if response.status_code == 422:
        response_422 = HTTPValidationError.from_dict(response.json())



        return response_422
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Response[Union[DerivedRelationGraphOut, HTTPValidationError]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient,
    relation_type: Union[None, Unset, str] = UNSET,
    from_object_id: Union[None, Unset, str] = UNSET,
    origin: Union[None, Unset, str] = UNSET,
    to_status: Union[None, Unset, str] = UNSET,
    limit: Union[Unset, int] = 1000,

) -> Response[Union[DerivedRelationGraphOut, HTTPValidationError]]:
    r""" List Derived Relations

     Derived candidate strategic-relations graph (ADR 0065, piste 1) — file-backed, pending validation.

    Strictly separate from the canonical `/relations` endpoint: these edges are extracted from the
    analysis fiches and are NOT canonical (see DERIVED_GRAPH_DISCLAIMER). No taint gate — like the
    file-backed `/chokepoint-analyses`, this is derived/public order-of-magnitude analysis, not
    redistribution-restricted source data.

    **Served from `analytics.derived_relation` since 2.1.0** — the graph the engines actually read, and
    therefore the wiring behind the `betweenness` on `/chokepoints/{id}/analysis`. Until then this
    endpoint published `seed/strategic_relations_candidates.yaml`, a different graph in both directions:
    769 edges of fiche extraction, of which 333 point at names outside the corpus, and none of the ~936
    edges the three SQL rules infer. A consumer tracing a served centrality was reading the wrong graph.

    What changed for you: the 333 out-of-corpus targets are gone (they are unresolved TEXT the engines
    never saw), ~936 co-location edges appear, and an edge disappears once a human promotes it to
    canonical — where it becomes visible on `/relations`. `origin` says which generator asserted each
    edge, because \"a human's fiche said so\" and \"both objects touch the same EEZ\" are not the same
    claim.

    Args:
        relation_type (Union[None, Unset, str]):
        from_object_id (Union[None, Unset, str]):
        origin (Union[None, Unset, str]): derived:fiche-extraction | derived:eez-colocation |
            derived:system-comembership | derived:shared-country — which generator asserted the edge
        to_status (Union[None, Unset, str]): Accepted and IGNORED since 2.1.0. Every edge is now
            `in_corpus` by construction (both endpoints are foreign keys), so the filter has nothing
            to select. Kept so a consumer passing it gets its rows rather than a 422.
        limit (Union[Unset, int]):  Default: 1000.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[DerivedRelationGraphOut, HTTPValidationError]]
     """


    kwargs = _get_kwargs(
        relation_type=relation_type,
from_object_id=from_object_id,
origin=origin,
to_status=to_status,
limit=limit,

    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)

def sync(
    *,
    client: AuthenticatedClient,
    relation_type: Union[None, Unset, str] = UNSET,
    from_object_id: Union[None, Unset, str] = UNSET,
    origin: Union[None, Unset, str] = UNSET,
    to_status: Union[None, Unset, str] = UNSET,
    limit: Union[Unset, int] = 1000,

) -> Optional[Union[DerivedRelationGraphOut, HTTPValidationError]]:
    r""" List Derived Relations

     Derived candidate strategic-relations graph (ADR 0065, piste 1) — file-backed, pending validation.

    Strictly separate from the canonical `/relations` endpoint: these edges are extracted from the
    analysis fiches and are NOT canonical (see DERIVED_GRAPH_DISCLAIMER). No taint gate — like the
    file-backed `/chokepoint-analyses`, this is derived/public order-of-magnitude analysis, not
    redistribution-restricted source data.

    **Served from `analytics.derived_relation` since 2.1.0** — the graph the engines actually read, and
    therefore the wiring behind the `betweenness` on `/chokepoints/{id}/analysis`. Until then this
    endpoint published `seed/strategic_relations_candidates.yaml`, a different graph in both directions:
    769 edges of fiche extraction, of which 333 point at names outside the corpus, and none of the ~936
    edges the three SQL rules infer. A consumer tracing a served centrality was reading the wrong graph.

    What changed for you: the 333 out-of-corpus targets are gone (they are unresolved TEXT the engines
    never saw), ~936 co-location edges appear, and an edge disappears once a human promotes it to
    canonical — where it becomes visible on `/relations`. `origin` says which generator asserted each
    edge, because \"a human's fiche said so\" and \"both objects touch the same EEZ\" are not the same
    claim.

    Args:
        relation_type (Union[None, Unset, str]):
        from_object_id (Union[None, Unset, str]):
        origin (Union[None, Unset, str]): derived:fiche-extraction | derived:eez-colocation |
            derived:system-comembership | derived:shared-country — which generator asserted the edge
        to_status (Union[None, Unset, str]): Accepted and IGNORED since 2.1.0. Every edge is now
            `in_corpus` by construction (both endpoints are foreign keys), so the filter has nothing
            to select. Kept so a consumer passing it gets its rows rather than a 422.
        limit (Union[Unset, int]):  Default: 1000.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[DerivedRelationGraphOut, HTTPValidationError]
     """


    return sync_detailed(
        client=client,
relation_type=relation_type,
from_object_id=from_object_id,
origin=origin,
to_status=to_status,
limit=limit,

    ).parsed

async def asyncio_detailed(
    *,
    client: AuthenticatedClient,
    relation_type: Union[None, Unset, str] = UNSET,
    from_object_id: Union[None, Unset, str] = UNSET,
    origin: Union[None, Unset, str] = UNSET,
    to_status: Union[None, Unset, str] = UNSET,
    limit: Union[Unset, int] = 1000,

) -> Response[Union[DerivedRelationGraphOut, HTTPValidationError]]:
    r""" List Derived Relations

     Derived candidate strategic-relations graph (ADR 0065, piste 1) — file-backed, pending validation.

    Strictly separate from the canonical `/relations` endpoint: these edges are extracted from the
    analysis fiches and are NOT canonical (see DERIVED_GRAPH_DISCLAIMER). No taint gate — like the
    file-backed `/chokepoint-analyses`, this is derived/public order-of-magnitude analysis, not
    redistribution-restricted source data.

    **Served from `analytics.derived_relation` since 2.1.0** — the graph the engines actually read, and
    therefore the wiring behind the `betweenness` on `/chokepoints/{id}/analysis`. Until then this
    endpoint published `seed/strategic_relations_candidates.yaml`, a different graph in both directions:
    769 edges of fiche extraction, of which 333 point at names outside the corpus, and none of the ~936
    edges the three SQL rules infer. A consumer tracing a served centrality was reading the wrong graph.

    What changed for you: the 333 out-of-corpus targets are gone (they are unresolved TEXT the engines
    never saw), ~936 co-location edges appear, and an edge disappears once a human promotes it to
    canonical — where it becomes visible on `/relations`. `origin` says which generator asserted each
    edge, because \"a human's fiche said so\" and \"both objects touch the same EEZ\" are not the same
    claim.

    Args:
        relation_type (Union[None, Unset, str]):
        from_object_id (Union[None, Unset, str]):
        origin (Union[None, Unset, str]): derived:fiche-extraction | derived:eez-colocation |
            derived:system-comembership | derived:shared-country — which generator asserted the edge
        to_status (Union[None, Unset, str]): Accepted and IGNORED since 2.1.0. Every edge is now
            `in_corpus` by construction (both endpoints are foreign keys), so the filter has nothing
            to select. Kept so a consumer passing it gets its rows rather than a 422.
        limit (Union[Unset, int]):  Default: 1000.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[DerivedRelationGraphOut, HTTPValidationError]]
     """


    kwargs = _get_kwargs(
        relation_type=relation_type,
from_object_id=from_object_id,
origin=origin,
to_status=to_status,
limit=limit,

    )

    response = await client.get_async_httpx_client().request(
        **kwargs
    )

    return _build_response(client=client, response=response)

async def asyncio(
    *,
    client: AuthenticatedClient,
    relation_type: Union[None, Unset, str] = UNSET,
    from_object_id: Union[None, Unset, str] = UNSET,
    origin: Union[None, Unset, str] = UNSET,
    to_status: Union[None, Unset, str] = UNSET,
    limit: Union[Unset, int] = 1000,

) -> Optional[Union[DerivedRelationGraphOut, HTTPValidationError]]:
    r""" List Derived Relations

     Derived candidate strategic-relations graph (ADR 0065, piste 1) — file-backed, pending validation.

    Strictly separate from the canonical `/relations` endpoint: these edges are extracted from the
    analysis fiches and are NOT canonical (see DERIVED_GRAPH_DISCLAIMER). No taint gate — like the
    file-backed `/chokepoint-analyses`, this is derived/public order-of-magnitude analysis, not
    redistribution-restricted source data.

    **Served from `analytics.derived_relation` since 2.1.0** — the graph the engines actually read, and
    therefore the wiring behind the `betweenness` on `/chokepoints/{id}/analysis`. Until then this
    endpoint published `seed/strategic_relations_candidates.yaml`, a different graph in both directions:
    769 edges of fiche extraction, of which 333 point at names outside the corpus, and none of the ~936
    edges the three SQL rules infer. A consumer tracing a served centrality was reading the wrong graph.

    What changed for you: the 333 out-of-corpus targets are gone (they are unresolved TEXT the engines
    never saw), ~936 co-location edges appear, and an edge disappears once a human promotes it to
    canonical — where it becomes visible on `/relations`. `origin` says which generator asserted each
    edge, because \"a human's fiche said so\" and \"both objects touch the same EEZ\" are not the same
    claim.

    Args:
        relation_type (Union[None, Unset, str]):
        from_object_id (Union[None, Unset, str]):
        origin (Union[None, Unset, str]): derived:fiche-extraction | derived:eez-colocation |
            derived:system-comembership | derived:shared-country — which generator asserted the edge
        to_status (Union[None, Unset, str]): Accepted and IGNORED since 2.1.0. Every edge is now
            `in_corpus` by construction (both endpoints are foreign keys), so the filter has nothing
            to select. Kept so a consumer passing it gets its rows rather than a 422.
        limit (Union[Unset, int]):  Default: 1000.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[DerivedRelationGraphOut, HTTPValidationError]
     """


    return (await asyncio_detailed(
        client=client,
relation_type=relation_type,
from_object_id=from_object_id,
origin=origin,
to_status=to_status,
limit=limit,

    )).parsed
