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
    to_status: Union[None, Unset, str] = UNSET,
    from_object_id: Union[None, Unset, str] = UNSET,
    limit: Union[Unset, int] = 1000,

) -> dict[str, Any]:
    

    

    params: dict[str, Any] = {}

    json_relation_type: Union[None, Unset, str]
    if isinstance(relation_type, Unset):
        json_relation_type = UNSET
    else:
        json_relation_type = relation_type
    params["relation_type"] = json_relation_type

    json_to_status: Union[None, Unset, str]
    if isinstance(to_status, Unset):
        json_to_status = UNSET
    else:
        json_to_status = to_status
    params["to_status"] = json_to_status

    json_from_object_id: Union[None, Unset, str]
    if isinstance(from_object_id, Unset):
        json_from_object_id = UNSET
    else:
        json_from_object_id = from_object_id
    params["from_object_id"] = json_from_object_id

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
    to_status: Union[None, Unset, str] = UNSET,
    from_object_id: Union[None, Unset, str] = UNSET,
    limit: Union[Unset, int] = 1000,

) -> Response[Union[DerivedRelationGraphOut, HTTPValidationError]]:
    """ List Derived Relations

     Derived candidate strategic-relations graph (ADR 0065, piste 1) — file-backed, pending validation.

    Strictly separate from the canonical `/relations` endpoint: these edges are extracted from the
    analysis fiches and are NOT canonical (see DERIVED_GRAPH_DISCLAIMER). No taint gate — like the
    file-backed `/chokepoint-analyses`, this is derived/public order-of-magnitude analysis, not
    redistribution-restricted source data.

    Args:
        relation_type (Union[None, Unset, str]):
        to_status (Union[None, Unset, str]): in_corpus | external_candidate
        from_object_id (Union[None, Unset, str]):
        limit (Union[Unset, int]):  Default: 1000.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[DerivedRelationGraphOut, HTTPValidationError]]
     """


    kwargs = _get_kwargs(
        relation_type=relation_type,
to_status=to_status,
from_object_id=from_object_id,
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
    to_status: Union[None, Unset, str] = UNSET,
    from_object_id: Union[None, Unset, str] = UNSET,
    limit: Union[Unset, int] = 1000,

) -> Optional[Union[DerivedRelationGraphOut, HTTPValidationError]]:
    """ List Derived Relations

     Derived candidate strategic-relations graph (ADR 0065, piste 1) — file-backed, pending validation.

    Strictly separate from the canonical `/relations` endpoint: these edges are extracted from the
    analysis fiches and are NOT canonical (see DERIVED_GRAPH_DISCLAIMER). No taint gate — like the
    file-backed `/chokepoint-analyses`, this is derived/public order-of-magnitude analysis, not
    redistribution-restricted source data.

    Args:
        relation_type (Union[None, Unset, str]):
        to_status (Union[None, Unset, str]): in_corpus | external_candidate
        from_object_id (Union[None, Unset, str]):
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
to_status=to_status,
from_object_id=from_object_id,
limit=limit,

    ).parsed

async def asyncio_detailed(
    *,
    client: AuthenticatedClient,
    relation_type: Union[None, Unset, str] = UNSET,
    to_status: Union[None, Unset, str] = UNSET,
    from_object_id: Union[None, Unset, str] = UNSET,
    limit: Union[Unset, int] = 1000,

) -> Response[Union[DerivedRelationGraphOut, HTTPValidationError]]:
    """ List Derived Relations

     Derived candidate strategic-relations graph (ADR 0065, piste 1) — file-backed, pending validation.

    Strictly separate from the canonical `/relations` endpoint: these edges are extracted from the
    analysis fiches and are NOT canonical (see DERIVED_GRAPH_DISCLAIMER). No taint gate — like the
    file-backed `/chokepoint-analyses`, this is derived/public order-of-magnitude analysis, not
    redistribution-restricted source data.

    Args:
        relation_type (Union[None, Unset, str]):
        to_status (Union[None, Unset, str]): in_corpus | external_candidate
        from_object_id (Union[None, Unset, str]):
        limit (Union[Unset, int]):  Default: 1000.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[DerivedRelationGraphOut, HTTPValidationError]]
     """


    kwargs = _get_kwargs(
        relation_type=relation_type,
to_status=to_status,
from_object_id=from_object_id,
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
    to_status: Union[None, Unset, str] = UNSET,
    from_object_id: Union[None, Unset, str] = UNSET,
    limit: Union[Unset, int] = 1000,

) -> Optional[Union[DerivedRelationGraphOut, HTTPValidationError]]:
    """ List Derived Relations

     Derived candidate strategic-relations graph (ADR 0065, piste 1) — file-backed, pending validation.

    Strictly separate from the canonical `/relations` endpoint: these edges are extracted from the
    analysis fiches and are NOT canonical (see DERIVED_GRAPH_DISCLAIMER). No taint gate — like the
    file-backed `/chokepoint-analyses`, this is derived/public order-of-magnitude analysis, not
    redistribution-restricted source data.

    Args:
        relation_type (Union[None, Unset, str]):
        to_status (Union[None, Unset, str]): in_corpus | external_candidate
        from_object_id (Union[None, Unset, str]):
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
to_status=to_status,
from_object_id=from_object_id,
limit=limit,

    )).parsed
