import { describe, it, expect } from "vitest";
import type { LookupMap, CostCenterInfoMap } from "../_shared";
import { parseOmieWaitSeconds } from "../_shared";
import {
  resolveCategoryId,
  resolveCostCenterId,
  deriveBUFromCostCenter,
  BU_NAME_PATTERNS,
} from "../_lookups";

// ── helpers ──────────────────────────────────────────────────────────────────

function makeLookup(entries: [string, string][]): LookupMap {
  return new Map(entries);
}

function makeCCInfoLookup(
  entries: [string, { name: string; override: string | null }][]
): CostCenterInfoMap {
  return new Map(entries);
}

// ── resolveCategoryId ────────────────────────────────────────────────────────

describe("resolveCategoryId", () => {
  const catLookup = makeLookup([
    ["100", "uuid-cat-100"],
    ["200", "uuid-cat-200"],
    ["300", "uuid-cat-300"],
  ]);

  it("resolves via codigo_categoria directly", () => {
    const conta = { codigo_categoria: "100" };
    expect(resolveCategoryId(conta, catLookup)).toBe("uuid-cat-100");
  });

  it("resolves via codigo_categoria as number (coerced to string)", () => {
    const conta = { codigo_categoria: 200 };
    expect(resolveCategoryId(conta, catLookup)).toBe("uuid-cat-200");
  });

  it("falls back to codigo_categoria_str when codigo_categoria is falsy", () => {
    const conta = { codigo_categoria: "", codigo_categoria_str: "300" };
    expect(resolveCategoryId(conta, catLookup)).toBe("uuid-cat-300");
  });

  it("falls back to codigo_categoria_str when codigo_categoria is undefined", () => {
    const conta = { codigo_categoria_str: "100" };
    expect(resolveCategoryId(conta, catLookup)).toBe("uuid-cat-100");
  });

  it("falls back to categorias[0].codigo_categoria array", () => {
    const conta = { categorias: [{ codigo_categoria: "200" }] };
    expect(resolveCategoryId(conta, catLookup)).toBe("uuid-cat-200");
  });

  it("prefers codigo_categoria over categorias array", () => {
    const conta = {
      codigo_categoria: "100",
      categorias: [{ codigo_categoria: "200" }],
    };
    expect(resolveCategoryId(conta, catLookup)).toBe("uuid-cat-100");
  });

  it("returns null when codigo_categoria exists but is not in lookup", () => {
    const conta = { codigo_categoria: "999" };
    expect(resolveCategoryId(conta, catLookup)).toBeNull();
  });

  it("tries categorias array when codigo_categoria is not in lookup", () => {
    const conta = {
      codigo_categoria: "999",
      categorias: [{ codigo_categoria: "100" }],
    };
    expect(resolveCategoryId(conta, catLookup)).toBe("uuid-cat-100");
  });

  it("returns null when no fields are present", () => {
    const conta = {};
    expect(resolveCategoryId(conta, catLookup)).toBeNull();
  });

  it("returns null when categorias array is empty", () => {
    const conta = { categorias: [] };
    expect(resolveCategoryId(conta, catLookup)).toBeNull();
  });

  it("returns null when categorias[0] has no codigo_categoria", () => {
    const conta = { categorias: [{}] };
    expect(resolveCategoryId(conta, catLookup)).toBeNull();
  });

  it("returns null with all fields undefined", () => {
    const conta = {
      codigo_categoria: undefined,
      codigo_categoria_str: undefined,
      categorias: undefined,
    };
    expect(resolveCategoryId(conta, catLookup)).toBeNull();
  });

  it("returns null with empty lookup map", () => {
    const conta = { codigo_categoria: "100" };
    expect(resolveCategoryId(conta, makeLookup([]))).toBeNull();
  });
});

// ── resolveCostCenterId ──────────────────────────────────────────────────────

describe("resolveCostCenterId", () => {
  const ccLookup = makeLookup([
    ["10", "uuid-cc-10"],
    ["20", "uuid-cc-20"],
  ]);

  it("resolves via departamentos[0].codigo_departamento", () => {
    const conta = { departamentos: [{ codigo_departamento: "10" }] };
    expect(resolveCostCenterId(conta, ccLookup)).toBe("uuid-cc-10");
  });

  it("resolves via departamentos[0] as number (coerced)", () => {
    const conta = { departamentos: [{ codigo_departamento: "20" }] };
    expect(resolveCostCenterId(conta, ccLookup)).toBe("uuid-cc-20");
  });

  it("falls back to codigo_departamento when departamentos is absent", () => {
    const conta = { codigo_departamento: "10" };
    expect(resolveCostCenterId(conta, ccLookup)).toBe("uuid-cc-10");
  });

  it("falls back to codigo_departamento when departamentos is empty", () => {
    const conta = { departamentos: [], codigo_departamento: "20" };
    expect(resolveCostCenterId(conta, ccLookup)).toBe("uuid-cc-20");
  });

  it("prefers departamentos[0] over codigo_departamento", () => {
    const conta = {
      departamentos: [{ codigo_departamento: "10" }],
      codigo_departamento: "20",
    };
    expect(resolveCostCenterId(conta, ccLookup)).toBe("uuid-cc-10");
  });

  it("falls back to codigo_departamento if departamentos[0] not in lookup", () => {
    const conta = {
      departamentos: [{ codigo_departamento: "999" }],
      codigo_departamento: "20",
    };
    expect(resolveCostCenterId(conta, ccLookup)).toBe("uuid-cc-20");
  });

  it("returns null when no match anywhere", () => {
    const conta = {
      departamentos: [{ codigo_departamento: "999" }],
      codigo_departamento: "888",
    };
    expect(resolveCostCenterId(conta, ccLookup)).toBeNull();
  });

  it("returns null when no fields present", () => {
    expect(resolveCostCenterId({}, ccLookup)).toBeNull();
  });

  it("returns null when departamentos[0] has no codigo_departamento", () => {
    const conta = { departamentos: [{}] };
    expect(resolveCostCenterId(conta, ccLookup)).toBeNull();
  });

  it("returns null with empty lookup", () => {
    const conta = { departamentos: [{ codigo_departamento: "10" }] };
    expect(resolveCostCenterId(conta, makeLookup([]))).toBeNull();
  });
});

// ── deriveBUFromCostCenter ───────────────────────────────────────────────────

describe("deriveBUFromCostCenter", () => {
  it("returns business_unit_override when present", () => {
    const ccInfo = makeCCInfoLookup([
      ["10", { name: "Qualquer Coisa", override: "Override BU" }],
    ]);
    const conta = { departamentos: [{ codigo_departamento: "10" }] };
    expect(deriveBUFromCostCenter(conta, ccInfo)).toBe("Override BU");
  });

  it("override takes priority over pattern match", () => {
    const ccInfo = makeCCInfoLookup([
      ["10", { name: "Branding Team", override: "Custom Unit" }],
    ]);
    const conta = { departamentos: [{ codigo_departamento: "10" }] };
    expect(deriveBUFromCostCenter(conta, ccInfo)).toBe("Custom Unit");
  });

  describe("pattern matching by cost center name", () => {
    const testCases: [string, string][] = [
      ["Branding", "Branding"],
      ["Equipe de Branding", "Branding"],
      ["Digital 3D", "Digital 3D"],
      ["3D Studio", "Digital 3D"],
      ["digital3d", "Digital 3D"],
      ["Performance", "Performance"],
      ["Trafego Pago", "Performance"],
      ["Tráfego", "Performance"],
      ["Social Media", "Social & Conteúdo"],
      ["Redes Sociais", "Social & Conteúdo"],
      ["Conteudo", "Social & Conteúdo"],
      ["Conteúdo Digital", "Social & Conteúdo"],
      ["Audiovisual", "Audiovisual"],
      ["Video Production", "Audiovisual"],
      ["Vídeo", "Audiovisual"],
      ["Filme Publicitário", "Audiovisual"],
      ["Design Gráfico", "Design"],
      ["Criacao Visual", "Design"],
      ["Criação", "Design"],
      ["Administrativo", "Administrativo"],
      ["Admin", "Administrativo"],
      ["Financeiro", "Administrativo"],
      ["RH", "Administrativo"],
      ["DP", "Administrativo"],
      ["Comercial", "Comercial"],
      ["Vendas", "Comercial"],
      ["Tecnologia", "Tecnologia"],
      ["Tech Team", "Tecnologia"],
      ["Dev", "Tecnologia"],
    ];

    for (const [ccName, expectedBU] of testCases) {
      it(`"${ccName}" → ${expectedBU}`, () => {
        const ccInfo = makeCCInfoLookup([
          ["50", { name: ccName, override: null }],
        ]);
        const conta = { departamentos: [{ codigo_departamento: "50" }] };
        expect(deriveBUFromCostCenter(conta, ccInfo)).toBe(expectedBU);
      });
    }
  });

  it("returns null when cost center name matches no pattern", () => {
    const ccInfo = makeCCInfoLookup([
      ["50", { name: "Jurídico", override: null }],
    ]);
    const conta = { departamentos: [{ codigo_departamento: "50" }] };
    expect(deriveBUFromCostCenter(conta, ccInfo)).toBeNull();
  });

  it("returns null when conta has no department info", () => {
    const ccInfo = makeCCInfoLookup([
      ["50", { name: "Branding", override: null }],
    ]);
    expect(deriveBUFromCostCenter({}, ccInfo)).toBeNull();
  });

  it("returns null when department ID is not in info lookup", () => {
    const ccInfo = makeCCInfoLookup([
      ["50", { name: "Branding", override: null }],
    ]);
    const conta = { departamentos: [{ codigo_departamento: "999" }] };
    expect(deriveBUFromCostCenter(conta, ccInfo)).toBeNull();
  });

  it("uses codigo_departamento fallback when departamentos is absent", () => {
    const ccInfo = makeCCInfoLookup([
      ["10", { name: "Performance Ads", override: null }],
    ]);
    const conta = { codigo_departamento: "10" };
    expect(deriveBUFromCostCenter(conta, ccInfo)).toBe("Performance");
  });

  it("uses codigo_departamento fallback when departamentos is empty", () => {
    const ccInfo = makeCCInfoLookup([
      ["10", { name: "Social Media", override: null }],
    ]);
    const conta = { departamentos: [], codigo_departamento: "10" };
    expect(deriveBUFromCostCenter(conta, ccInfo)).toBe("Social & Conteúdo");
  });

  it("returns null when departamentos[0] has no codigo_departamento and no fallback", () => {
    const ccInfo = makeCCInfoLookup([
      ["50", { name: "Branding", override: null }],
    ]);
    const conta = { departamentos: [{}] };
    expect(deriveBUFromCostCenter(conta, ccInfo)).toBeNull();
  });
});

// ── BU_NAME_PATTERNS ─────────────────────────────────────────────────────────

describe("BU_NAME_PATTERNS", () => {
  it("has 9 patterns", () => {
    expect(BU_NAME_PATTERNS).toHaveLength(9);
  });

  const expectations: [string, string[]][] = [
    ["Branding", ["branding", "BRANDING", "Equipe Branding"]],
    ["Digital 3D", ["Digital 3D", "digital3d", "3D", "3d renders"]],
    ["Performance", ["performance", "trafego", "tráfego", "Trafego Pago"]],
    [
      "Social & Conteúdo",
      ["social", "redes", "conteudo", "conteúdo", "Redes Sociais"],
    ],
    ["Audiovisual", ["audiovisual", "video", "vídeo", "filme"]],
    ["Design", ["design", "criacao", "criação"]],
    [
      "Administrativo",
      ["administrativo", "admin", "financeiro", "rh", "dp", "RH"],
    ],
    ["Comercial", ["comercial", "vendas", "VENDAS"]],
    ["Tecnologia", ["tecnologia", "tech", "dev", "DEV"]],
  ];

  for (const [bu, inputs] of expectations) {
    describe(`BU: ${bu}`, () => {
      const entry = BU_NAME_PATTERNS.find((p) => p.bu === bu);

      it("pattern exists", () => {
        expect(entry).toBeDefined();
      });

      for (const input of inputs) {
        it(`matches "${input}"`, () => {
          expect(entry!.pattern.test(input)).toBe(true);
        });
      }
    });
  }

  it("patterns are case-insensitive (all have /i flag)", () => {
    for (const { pattern } of BU_NAME_PATTERNS) {
      expect(pattern.flags).toContain("i");
    }
  });
});

// ── parseOmieWaitSeconds ─────────────────────────────────────────────────────

describe("parseOmieWaitSeconds", () => {
  it('extracts seconds and adds 2: "Aguarde 15 segundos" → 17', () => {
    const text =
      "Consumo redundante. Aguarde 15 segundos para uma nova requisição.";
    expect(parseOmieWaitSeconds(text)).toBe(17);
  });

  it('extracts seconds and adds 2: "Aguarde 5 segundos" → 7', () => {
    const text = "Aguarde 5 segundos para tentar novamente.";
    expect(parseOmieWaitSeconds(text)).toBe(7);
  });

  it("returns 15 as default when no match", () => {
    expect(parseOmieWaitSeconds("Some other error message")).toBe(15);
    expect(parseOmieWaitSeconds("")).toBe(15);
  });

  it("caps at 30 seconds", () => {
    const text = "Aguarde 50 segundos para uma nova requisição.";
    expect(parseOmieWaitSeconds(text)).toBe(30);
  });

  it("handles edge case: Aguarde 0 segundos → 2", () => {
    expect(parseOmieWaitSeconds("Aguarde 0 segundos")).toBe(2);
  });

  it("handles edge case: Aguarde 28 segundos → 30 (capped)", () => {
    expect(parseOmieWaitSeconds("Aguarde 28 segundos")).toBe(30);
  });

  it("is case-insensitive", () => {
    expect(parseOmieWaitSeconds("aguarde 10 segundos")).toBe(12);
  });
});
