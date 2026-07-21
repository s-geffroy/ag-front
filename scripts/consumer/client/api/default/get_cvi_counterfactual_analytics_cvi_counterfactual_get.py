from http import HTTPStatus
from typing import Any, Optional, Union, cast

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.cvi_counterfactual_out import CviCounterfactualOut
from ...models.get_cvi_counterfactual_analytics_cvi_counterfactual_get_scope import GetCviCounterfactualAnalyticsCviCounterfactualGetScope
from ...models.http_validation_error import HTTPValidationError
from ...types import UNSET, Unset
from typing import cast
from typing import Union



def _get_kwargs(
    *,
    scope: Union[Unset, GetCviCounterfactualAnalyticsCviCounterfactualGetScope] = GetCviCounterfactualAnalyticsCviCounterfactualGetScope.CORE,

) -> dict[str, Any]:
    

    

    params: dict[str, Any] = {}

    json_scope: Union[Unset, str] = UNSET
    if not isinstance(scope, Unset):
        json_scope = scope.value

    params["scope"] = json_scope


    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}


    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/analytics/cvi-counterfactual",
        "params": params,
    }


    return _kwargs


def _parse_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Optional[Union[CviCounterfactualOut, HTTPValidationError]]:
    if response.status_code == 200:
        response_200 = CviCounterfactualOut.from_dict(response.json())



        return response_200
    if response.status_code == 422:
        response_422 = HTTPValidationError.from_dict(response.json())



        return response_422
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: Union[AuthenticatedClient, Client], response: httpx.Response) -> Response[Union[CviCounterfactualOut, HTTPValidationError]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient,
    scope: Union[Unset, GetCviCounterfactualAnalyticsCviCounterfactualGetScope] = GetCviCounterfactualAnalyticsCviCounterfactualGetScope.CORE,

) -> Response[Union[CviCounterfactualOut, HTTPValidationError]]:
    """ Get Cvi Counterfactual

     The `concentration`-removed CVI level-slide, counted over one population (ADR 0070); candidate.

    Derived/candidate, never canonical (ADR 0005); scope `read`. Additive block requested by ag-front
    (0012): it replays the engine to count, in the never-examined-for-substitution cohort, how the
    binding-constraint `global_level` slides once the inferred-from-absence `concentration` dimension is
    dropped (`changent`, and `critique_vers_bas` for the full critique→bas fall). `population` is a live
    count — it drifts with the base, and that drift is meant to be visible. No per-object identity is
    exposed, so no taint filter applies. `scope` is a bounded enum (`core` default; `bulk` has no CVI
    scores → population 0). Served clearly marked candidate; it validates nothing.

    Args:
        scope (Union[Unset, GetCviCounterfactualAnalyticsCviCounterfactualGetScope]):  Default:
            GetCviCounterfactualAnalyticsCviCounterfactualGetScope.CORE.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[CviCounterfactualOut, HTTPValidationError]]
     """


    kwargs = _get_kwargs(
        scope=scope,

    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)

def sync(
    *,
    client: AuthenticatedClient,
    scope: Union[Unset, GetCviCounterfactualAnalyticsCviCounterfactualGetScope] = GetCviCounterfactualAnalyticsCviCounterfactualGetScope.CORE,

) -> Optional[Union[CviCounterfactualOut, HTTPValidationError]]:
    """ Get Cvi Counterfactual

     The `concentration`-removed CVI level-slide, counted over one population (ADR 0070); candidate.

    Derived/candidate, never canonical (ADR 0005); scope `read`. Additive block requested by ag-front
    (0012): it replays the engine to count, in the never-examined-for-substitution cohort, how the
    binding-constraint `global_level` slides once the inferred-from-absence `concentration` dimension is
    dropped (`changent`, and `critique_vers_bas` for the full critique→bas fall). `population` is a live
    count — it drifts with the base, and that drift is meant to be visible. No per-object identity is
    exposed, so no taint filter applies. `scope` is a bounded enum (`core` default; `bulk` has no CVI
    scores → population 0). Served clearly marked candidate; it validates nothing.

    Args:
        scope (Union[Unset, GetCviCounterfactualAnalyticsCviCounterfactualGetScope]):  Default:
            GetCviCounterfactualAnalyticsCviCounterfactualGetScope.CORE.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[CviCounterfactualOut, HTTPValidationError]
     """


    return sync_detailed(
        client=client,
scope=scope,

    ).parsed

async def asyncio_detailed(
    *,
    client: AuthenticatedClient,
    scope: Union[Unset, GetCviCounterfactualAnalyticsCviCounterfactualGetScope] = GetCviCounterfactualAnalyticsCviCounterfactualGetScope.CORE,

) -> Response[Union[CviCounterfactualOut, HTTPValidationError]]:
    """ Get Cvi Counterfactual

     The `concentration`-removed CVI level-slide, counted over one population (ADR 0070); candidate.

    Derived/candidate, never canonical (ADR 0005); scope `read`. Additive block requested by ag-front
    (0012): it replays the engine to count, in the never-examined-for-substitution cohort, how the
    binding-constraint `global_level` slides once the inferred-from-absence `concentration` dimension is
    dropped (`changent`, and `critique_vers_bas` for the full critique→bas fall). `population` is a live
    count — it drifts with the base, and that drift is meant to be visible. No per-object identity is
    exposed, so no taint filter applies. `scope` is a bounded enum (`core` default; `bulk` has no CVI
    scores → population 0). Served clearly marked candidate; it validates nothing.

    Args:
        scope (Union[Unset, GetCviCounterfactualAnalyticsCviCounterfactualGetScope]):  Default:
            GetCviCounterfactualAnalyticsCviCounterfactualGetScope.CORE.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[CviCounterfactualOut, HTTPValidationError]]
     """


    kwargs = _get_kwargs(
        scope=scope,

    )

    response = await client.get_async_httpx_client().request(
        **kwargs
    )

    return _build_response(client=client, response=response)

async def asyncio(
    *,
    client: AuthenticatedClient,
    scope: Union[Unset, GetCviCounterfactualAnalyticsCviCounterfactualGetScope] = GetCviCounterfactualAnalyticsCviCounterfactualGetScope.CORE,

) -> Optional[Union[CviCounterfactualOut, HTTPValidationError]]:
    """ Get Cvi Counterfactual

     The `concentration`-removed CVI level-slide, counted over one population (ADR 0070); candidate.

    Derived/candidate, never canonical (ADR 0005); scope `read`. Additive block requested by ag-front
    (0012): it replays the engine to count, in the never-examined-for-substitution cohort, how the
    binding-constraint `global_level` slides once the inferred-from-absence `concentration` dimension is
    dropped (`changent`, and `critique_vers_bas` for the full critique→bas fall). `population` is a live
    count — it drifts with the base, and that drift is meant to be visible. No per-object identity is
    exposed, so no taint filter applies. `scope` is a bounded enum (`core` default; `bulk` has no CVI
    scores → population 0). Served clearly marked candidate; it validates nothing.

    Args:
        scope (Union[Unset, GetCviCounterfactualAnalyticsCviCounterfactualGetScope]):  Default:
            GetCviCounterfactualAnalyticsCviCounterfactualGetScope.CORE.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[CviCounterfactualOut, HTTPValidationError]
     """


    return (await asyncio_detailed(
        client=client,
scope=scope,

    )).parsed
