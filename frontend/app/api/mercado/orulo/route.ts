// ---------------------------------------------------------------------------
// API Route — Proxy para Órulo API
// ---------------------------------------------------------------------------
// Protege client_id/client_secret no server side.
// GET /api/mercado/orulo?action=buildings&state=PR&city=Curitiba&page=1
// GET /api/mercado/orulo?action=building&id=34234
// GET /api/mercado/orulo?action=states
// GET /api/mercado/orulo?action=cities&state=PR
// GET /api/mercado/orulo?action=areas&state=PR&city=Curitiba
// GET /api/mercado/orulo?action=search&name=925
// GET /api/mercado/orulo?action=active_ids&page=1
// GET /api/mercado/orulo?action=typologies&building_id=34234
// GET /api/mercado/orulo?action=partners&page=1
// GET /api/mercado/orulo?action=features
// GET /api/mercado/orulo?action=types
// GET /api/mercado/orulo?action=config
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getOruloToken,
  fetchBuildings,
  fetchBuildingById,
  searchBuildingsByName,
  fetchActiveBuildingIds,
  fetchRemovedBuildingIds,
  fetchTypologies,
  fetchImages,
  fetchFloorPlans,
  fetchUnits,
  fetchPartners,
  fetchPartnerById,
  fetchStates,
  fetchCities,
  fetchAreas,
  fetchFeaturesList,
  fetchBuildingTypes,
  fetchAppConfig,
} from "@/features/mercado/services/orulo";
import type { OruloBuildingFilters } from "@/features/mercado/types/orulo";

function getEnvCredentials() {
  const clientId = process.env.ORULO_CLIENT_ID;
  const clientSecret = process.env.ORULO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("ORULO_CLIENT_ID e ORULO_CLIENT_SECRET não configurados");
  }
  return { clientId, clientSecret };
}

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, clientSecret } = getEnvCredentials();
    const token = await getOruloToken(clientId, clientSecret);

    const { searchParams } = request.nextUrl;
    const action = searchParams.get("action");

    switch (action) {
      // ── Endereços ──────────────────────────────────────────────
      case "states": {
        const data = await fetchStates(token);
        return NextResponse.json(data);
      }

      case "cities": {
        const state = searchParams.get("state");
        if (!state) return NextResponse.json({ error: "state obrigatório" }, { status: 400 });
        const data = await fetchCities(token, state);
        return NextResponse.json(data);
      }

      case "areas": {
        const state = searchParams.get("state");
        const city = searchParams.get("city");
        if (!state || !city)
          return NextResponse.json({ error: "state e city obrigatórios" }, { status: 400 });
        const data = await fetchAreas(token, state, city);
        return NextResponse.json(data);
      }

      // ── Empreendimentos ────────────────────────────────────────
      case "buildings": {
        const filters: OruloBuildingFilters = {};
        const state = searchParams.get("state");
        const city = searchParams.get("city");
        const page = searchParams.get("page");
        const resultsPerPage = searchParams.get("results_per_page");
        const updatedAfter = searchParams.get("updated_after");
        const minPrice = searchParams.get("min_price");
        const maxPrice = searchParams.get("max_price");
        const priceOrder = searchParams.get("price_order");
        const includeNotAvailable = searchParams.get("include_not_available");

        if (state) filters.state = state;
        if (city) filters.city = city;
        if (page) filters.page = Number(page);
        if (resultsPerPage) filters.results_per_page = Number(resultsPerPage);
        if (updatedAfter) filters.updated_after = updatedAfter;
        if (minPrice) filters.min_price = Number(minPrice);
        if (maxPrice) filters.max_price = Number(maxPrice);
        if (priceOrder === "asc" || priceOrder === "desc") filters.price_order = priceOrder;
        if (includeNotAvailable === "true") filters.include = ["not_available"];

        // Array filters from comma-separated values
        const bedrooms = searchParams.get("bedrooms");
        if (bedrooms) filters.bedrooms = bedrooms.split(",");
        const status = searchParams.get("status");
        if (status)
          filters.status = status.split(",") as OruloBuildingFilters["status"];
        const finality = searchParams.get("finality");
        if (finality)
          filters.finality = finality.split(",") as OruloBuildingFilters["finality"];
        const portfolio = searchParams.get("portfolio");
        if (portfolio)
          filters.portfolio = portfolio.split(",") as OruloBuildingFilters["portfolio"];

        const data = await fetchBuildings(token, filters);
        return NextResponse.json(data);
      }

      case "building": {
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
        const include = searchParams.get("include_not_available") === "true"
          ? ["not_available"]
          : undefined;
        const data = await fetchBuildingById(token, id, include);
        return NextResponse.json(data);
      }

      case "search": {
        const name = searchParams.get("name");
        if (!name) return NextResponse.json({ error: "name obrigatório" }, { status: 400 });
        const maxResults = searchParams.get("max_results");
        const data = await searchBuildingsByName(
          token,
          name,
          maxResults ? Number(maxResults) : undefined,
        );
        return NextResponse.json(data);
      }

      // ── Sincronização ──────────────────────────────────────────
      case "active_ids": {
        const page = searchParams.get("page");
        const updatedAfter = searchParams.get("updated_after");
        const data = await fetchActiveBuildingIds(token, {
          page: page ? Number(page) : undefined,
          updated_after: updatedAfter ?? undefined,
          results_per_page: 500,
        });
        return NextResponse.json(data);
      }

      case "removed_ids": {
        const updatedAfter = searchParams.get("updated_after");
        if (!updatedAfter)
          return NextResponse.json({ error: "updated_after obrigatório" }, { status: 400 });
        const page = searchParams.get("page");
        const data = await fetchRemovedBuildingIds(token, updatedAfter, {
          page: page ? Number(page) : undefined,
          results_per_page: 500,
        });
        return NextResponse.json(data);
      }

      case "config": {
        const data = await fetchAppConfig(token);
        return NextResponse.json(data);
      }

      // ── Detalhes ───────────────────────────────────────────────
      case "typologies": {
        const buildingId = searchParams.get("building_id");
        if (!buildingId)
          return NextResponse.json({ error: "building_id obrigatório" }, { status: 400 });
        const data = await fetchTypologies(token, buildingId);
        return NextResponse.json(data);
      }

      case "images": {
        const buildingId = searchParams.get("building_id");
        if (!buildingId)
          return NextResponse.json({ error: "building_id obrigatório" }, { status: 400 });
        const dims = searchParams.get("dimensions")?.split(",") ?? [
          "520x280",
          "1024x1024",
        ];
        const data = await fetchImages(token, buildingId, dims);
        return NextResponse.json(data);
      }

      case "floor_plans": {
        const buildingId = searchParams.get("building_id");
        if (!buildingId)
          return NextResponse.json({ error: "building_id obrigatório" }, { status: 400 });
        const dims = searchParams.get("dimensions")?.split(",") ?? [
          "520x280",
          "1024x1024",
        ];
        const data = await fetchFloorPlans(token, buildingId, dims);
        return NextResponse.json(data);
      }

      case "units": {
        const buildingId = searchParams.get("building_id");
        const typologyId = searchParams.get("typology_id");
        if (!buildingId || !typologyId)
          return NextResponse.json(
            { error: "building_id e typology_id obrigatórios" },
            { status: 400 },
          );
        const data = await fetchUnits(token, buildingId, typologyId);
        return NextResponse.json(data);
      }

      // ── Parceiros ──────────────────────────────────────────────
      case "partners": {
        const page = searchParams.get("page");
        const state = searchParams.get("state");
        const city = searchParams.get("city");
        const data = await fetchPartners(token, {
          state: state ?? undefined,
          city: city ?? undefined,
          page: page ? Number(page) : undefined,
          results_per_page: 50,
        });
        return NextResponse.json(data);
      }

      case "partner": {
        const partnerId = searchParams.get("id");
        if (!partnerId)
          return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
        const data = await fetchPartnerById(token, partnerId);
        return NextResponse.json(data);
      }

      // ── Auxiliares ─────────────────────────────────────────────
      case "features": {
        const data = await fetchFeaturesList(token);
        return NextResponse.json(data);
      }

      case "types": {
        const data = await fetchBuildingTypes(token);
        return NextResponse.json(data);
      }

      default:
        return NextResponse.json(
          {
            error: "action inválida",
            available: [
              "states", "cities", "areas",
              "buildings", "building", "search",
              "active_ids", "removed_ids", "config",
              "typologies", "images", "floor_plans", "units",
              "partners", "partner",
              "features", "types",
            ],
          },
          { status: 400 },
        );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
