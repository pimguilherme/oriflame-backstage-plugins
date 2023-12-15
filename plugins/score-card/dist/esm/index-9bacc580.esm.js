import { createApiRef, createRouteRef, useApi, configApiRef, errorApiRef, createPlugin, createApiFactory, fetchApiRef, createRoutableExtension, createComponentExtension } from '@backstage/core-plugin-api';
import { EntityRefLink, catalogApiRef } from '@backstage/plugin-catalog-react';
import { RELATION_OWNED_BY, parseEntityRef, DEFAULT_NAMESPACE } from '@backstage/catalog-model';
import React, { useEffect } from 'react';
import { ResponseErrorPanel, Progress, Table, Link } from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
import { Chip } from '@material-ui/core';

var ScoreSuccessEnum = /* @__PURE__ */ ((ScoreSuccessEnum2) => {
  ScoreSuccessEnum2["Success"] = "success";
  ScoreSuccessEnum2["AlmostSuccess"] = "almost-success";
  ScoreSuccessEnum2["Partial"] = "partial";
  ScoreSuccessEnum2["AlmostFailure"] = "almost-failure";
  ScoreSuccessEnum2["Failure"] = "failure";
  return ScoreSuccessEnum2;
})(ScoreSuccessEnum || {});

const scoringDataApiRef = createApiRef({
  id: "plugin.scoringdata.service"
});

class ScoringDataJsonClient {
  constructor({
    configApi,
    catalogApi,
    fetchApi
  }) {
    this.configApi = configApi;
    this.catalogApi = catalogApi;
    this.fetchApi = fetchApi;
  }
  async getScore(entity) {
    if (!entity) {
      return void 0;
    }
    const jsonDataUrl = this.getJsonDataUrl();
    const urlWithData = `${jsonDataUrl}${entity.metadata.namespace}/${entity.kind}/${entity.metadata.name}.json`.toLowerCase();
    const result = await fetch(urlWithData).then((res) => {
      switch (res.status) {
        case 404:
          return null;
        case 200:
          return res.json();
        default:
          throw new Error(`error from server (code ${res.status})`);
      }
    });
    if (!result) {
      return void 0;
    }
    return this.extendEntityScore(result, void 0);
  }
  async getAllScores(entityKindFilter) {
    var _a;
    const jsonDataUrl = this.getJsonDataUrl();
    const urlWithData = `${jsonDataUrl}all.json`;
    let result = await fetch(urlWithData).then(
      (res) => {
        switch (res.status) {
          case 404:
            return void 0;
          case 200:
            return res.json();
          default:
            throw new Error(`error from server (code ${res.status})`);
        }
      }
    );
    if (!result)
      return void 0;
    if (entityKindFilter && entityKindFilter.length) {
      result = result.filter((entity) => {
        var _a2;
        return entityKindFilter.map((f) => f.toLocaleLowerCase()).includes((_a2 = entity.entityRef) == null ? void 0 : _a2.kind.toLowerCase());
      });
    }
    const entity_names = result.reduce((acc, a) => {
      var _a2;
      if ((_a2 = a.entityRef) == null ? void 0 : _a2.name) {
        acc.add(a.entityRef.name);
      }
      return acc;
    }, /* @__PURE__ */ new Set());
    const fetchAllEntities = (_a = this.configApi.getOptionalBoolean("scorecards.fetchAllEntities")) != null ? _a : false;
    const response = await this.catalogApi.getEntities({
      filter: fetchAllEntities ? entityKindFilter ? { kind: entityKindFilter } : {} : {
        "metadata.name": Array.from(entity_names)
      },
      fields: ["kind", "metadata.name", "metadata.namespace", "spec.owner", "relations"]
    });
    const entities = fetchAllEntities ? response.items.filter((i) => entity_names.has(i.metadata.name)) : response.items;
    return result.map((score) => {
      return this.extendEntityScore(score, entities);
    });
  }
  // ---- HELPER METHODS ---- //
  getJsonDataUrl() {
    var _a;
    return (_a = this.configApi.getOptionalString("scorecards.jsonDataUrl")) != null ? _a : "https://unknown-url-please-configure";
  }
  extendEntityScore(score, entities) {
    var _a, _b, _c, _d, _e, _f;
    if (score === null) {
      throw new Error(`can not extend null entity score.`);
    }
    if (typeof score === "undefined") {
      throw new Error(`can not extend undefined entity score.`);
    }
    const catalogEntity = entities ? entities.find(
      (entity) => {
        var _a2, _b2, _c2, _d2, _e2;
        return entity.metadata.name === ((_a2 = score.entityRef) == null ? void 0 : _a2.name) && (!((_b2 = score.entityRef) == null ? void 0 : _b2.kind) || entity.kind.toLowerCase() === ((_c2 = score.entityRef) == null ? void 0 : _c2.kind.toLowerCase())) && (!((_d2 = score.entityRef) == null ? void 0 : _d2.namespace) || (entity.metadata.namespace || "default").toLowerCase() == ((_e2 = score.entityRef) == null ? void 0 : _e2.namespace.toLowerCase()));
      }
    ) : void 0;
    const owner = (_b = (_a = catalogEntity == null ? void 0 : catalogEntity.relations) == null ? void 0 : _a.find(
      (r) => r.type === RELATION_OWNED_BY
    )) == null ? void 0 : _b.targetRef;
    let reviewer = void 0;
    if (score.scoringReviewer && !((_c = score.scoringReviewer) == null ? void 0 : _c.name)) {
      reviewer = { name: score.scoringReviewer, kind: "User", namespace: "default" };
    } else if ((_d = score.scoringReviewer) == null ? void 0 : _d.name) {
      const scoringReviewer = score.scoringReviewer;
      reviewer = { name: scoringReviewer.name, kind: (_e = scoringReviewer == null ? void 0 : scoringReviewer.kind) != null ? _e : "User", namespace: (_f = scoringReviewer == null ? void 0 : scoringReviewer.namespace) != null ? _f : "default" };
    }
    const reviewDate = score.scoringReviewDate ? new Date(score.scoringReviewDate) : void 0;
    return {
      owner: owner ? parseEntityRef(owner) : void 0,
      reviewer,
      reviewDate,
      ...score
    };
  }
}

const rootRouteRef = createRouteRef({
  id: "score-card"
});

const CUSTOM_COLOR_COMBINATION_CONFIG_REGEXP = /^\S+\s+#[0-9a-f]{6,8}\s+#[0-9a-f]{6,8}$/i;
const CUSTOM_COLOR_COMBINATION_INLINE_REGEXP = /^#[0-9a-f]{6,8}\s+#[0-9a-f]{6,8}$/i;
const defaultColorCombinations = {
  // Extra details colors based on score
  "extra-details-failure": ["#5a0000", "#ff000022"],
  "extra-details-almost-failure": ["#5a0000", "#ff000022"],
  "extra-details-partial": ["#5a0000", "#ff000022"],
  "extra-details-almost-success": ["#0f4a0f", "#72af5026"],
  "extra-details-success": ["#0f4a0f", "#72af5026"],
  "extra-details-unknown": ["#FFFFFF", "#001F3F"],
  // Score colors
  // see palette https://coolors.co/72af50-acbf8c-e2e8b3-ffc055-eb6f35
  "score-success": ["rgba(0, 0, 0, 0.87)", "rgb(114, 175, 80)"],
  "score-almost-success": ["rgba(0, 0, 0, 0.87)", "rgb(172, 191, 140)"],
  "score-partial": ["rgba(0, 0, 0, 0.87)", "rgb(226, 232, 179)"],
  "score-almost-failure": ["rgba(0, 0, 0, 0.87)", "rgb(255, 192, 85)"],
  "score-failure": ["rgba(0, 0, 0, 0.87)", "rgb(235, 111, 53)"],
  "score-unknown": ["rgba(0, 0, 0, 0.87)", "rgb(158, 158, 158)"],
  // Some colors used for labels and other things .. Thanks to ChatGPT  :)
  "white": ["#000000", "#FFFFFF"],
  "snow": ["#FFFFFF", "#001F3F"],
  "graphite": ["#555555", "#CCCCCC"],
  "arctic": ["#34495E", "#ECF0F1"],
  "steel-blue": ["#266294", "#B0C4DE"],
  "emerald": ["#23894e", "#D0ECE7"],
  "iceberg": ["#3c9366", "#DFF0E2"],
  "sapphire": ["#3498DB", "#D5EAF8"],
  "periwinkle": ["#8E44AD", "#D2B4DE"],
  "lavender": ["#6A5ACD", "#dddded"],
  "sky": ["#3498DB", "#c7e1f3"],
  "azure": ["#0074D9", "#F0FFFF"],
  "teal": ["#00877a", "#B2DFDB"],
  "cerulean": ["#003366", "#00BFFF"],
  "indigo": ["#4B0082", "#A9A9F5"],
  "olive": ["#808000", "#DAF7A6"],
  "royal": ["#88bcff", "#273746"],
  "turquoise": ["#16A085", "#E8F8F5"],
  "sage": ["#5F6A6A", "#A9DFBF"],
  "seafoam": ["#4fa573", "#E0F8D8"],
  "lilac": ["#aa71c1", "#F4ECF7"]
};
let cachedColorCombinations = void 0;
const getColorCombinations = () => {
  if (cachedColorCombinations) {
    return cachedColorCombinations;
  }
  let colorCombinations = defaultColorCombinations;
  const config = useApi(configApiRef);
  const customCombinationsString = config.getOptionalString("scorecards.colorCombinations");
  if (customCombinationsString) {
    console.debug("Custom color combinations loaded: %s", customCombinationsString);
    const customCombinations = customCombinationsString.split("\n").reduce((map, line) => {
      if (line.match(CUSTOM_COLOR_COMBINATION_CONFIG_REGEXP)) {
        const configParts = line.split(/\s+/);
        map[configParts[0]] = [configParts[1], configParts[2]];
      } else {
        console.warn("Could not match scorecards.colorCombinations line [%s] with regexp [%s], which is the supported configuration format.. please follow it!", line, CUSTOM_COLOR_COMBINATION_CONFIG_REGEXP);
      }
      return map;
    }, {});
    colorCombinations = {
      ...colorCombinations,
      ...customCombinations
    };
  }
  cachedColorCombinations = colorCombinations;
  return cachedColorCombinations;
};
const nameToColorCombinationConverter = (name) => {
  const colorCombinations = getColorCombinations();
  if (name && name in colorCombinations) {
    return {
      foreground: colorCombinations[name][0],
      background: colorCombinations[name][1]
    };
  }
  if (name == null ? void 0 : name.match(CUSTOM_COLOR_COMBINATION_INLINE_REGEXP)) {
    const parts = name.split(/\s+/);
    return {
      foreground: parts[0],
      background: parts[1]
    };
  }
  return nameToColorCombinationConverter("white");
};

const scoreToColorConverter = (scoreSuccess) => {
  if (typeof scoreSuccess === "undefined") {
    return nameToColorCombinationConverter(`score-unknown`);
  }
  switch (scoreSuccess) {
    case ScoreSuccessEnum.Success:
    case ScoreSuccessEnum.AlmostSuccess:
    case ScoreSuccessEnum.Partial:
    case ScoreSuccessEnum.AlmostFailure:
    case ScoreSuccessEnum.Failure:
      return nameToColorCombinationConverter(`score-${scoreSuccess}`);
    default:
      return nameToColorCombinationConverter(`score-unknown`);
  }
};

const getWarningPanel = (error) => {
  return /* @__PURE__ */ React.createElement(
    ResponseErrorPanel,
    {
      error,
      title: "Could not load data",
      defaultExpanded: true,
      key: "error"
    }
  );
};

const useScoringAllDataLoader = (entityKindFilter) => {
  const errorApi = useApi(errorApiRef);
  const scorigDataApi = useApi(scoringDataApiRef);
  const { error, value, loading } = useAsync(
    async () => scorigDataApi.getAllScores(entityKindFilter),
    [scorigDataApi]
  );
  useEffect(() => {
    if (error) {
      errorApi.post(error);
    }
  }, [error, errorApi]);
  return { loading, value, error };
};
const ScoreTable = ({ title, scores }) => {
  const columns = [
    {
      title: "Name",
      field: "entityRef.name",
      render: (entityScore) => {
        var _a, _b;
        if (!((_a = entityScore.entityRef) == null ? void 0 : _a.name)) {
          return /* @__PURE__ */ React.createElement(React.Fragment, null, "Missing entityRef.name key");
        }
        return /* @__PURE__ */ React.createElement(
          Link,
          {
            to: `/catalog/${(_b = entityScore.entityRef.namespace) != null ? _b : DEFAULT_NAMESPACE}/${entityScore.entityRef.kind}/${entityScore.entityRef.name}/score`,
            "data-id": entityScore.entityRef.name
          },
          entityScore.entityRef.name
        );
      }
    },
    {
      title: "Kind",
      field: "entityRef.kind",
      render: (entityScore) => {
        return /* @__PURE__ */ React.createElement(React.Fragment, null, entityScore.entityRef.kind);
      }
    },
    {
      title: "Owner",
      field: "owner.name",
      render: (entityScore) => entityScore.owner ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(EntityRefLink, { entityRef: entityScore.owner }, entityScore.owner.name)) : null
    },
    {
      title: "Reviewer",
      field: "scoringReviewer",
      render: (entityScore) => {
        var _a;
        return entityScore.reviewer ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(EntityRefLink, { entityRef: entityScore.reviewer }, (_a = entityScore.reviewer) == null ? void 0 : _a.name)) : null;
      }
    },
    {
      title: "Date",
      field: "scoringReviewDate",
      render: (entityScore) => entityScore.reviewDate ? /* @__PURE__ */ React.createElement(React.Fragment, null, entityScore.reviewDate.toLocaleDateString()) : null
    }
  ];
  scores.flatMap((s) => {
    var _a;
    return (_a = s.areaScores) != null ? _a : [];
  }).reduce((areas, area) => {
    if (!area || !area.title || areas.findIndex((x) => x === area.title) !== -1)
      return areas;
    areas.push(area.title);
    columns.push({
      title: area.title,
      field: "n/a",
      customSort: (d1, d2) => {
        var _a, _b;
        const d1ScoreEntry = (d1 == null ? void 0 : d1.areaScores) ? (_a = d1.areaScores.find((a) => a.title === area.title)) == null ? void 0 : _a.scorePercent : void 0;
        const d2ScoreEntry = (d2 == null ? void 0 : d2.areaScores) ? (_b = d2.areaScores.find((a) => a.title === area.title)) == null ? void 0 : _b.scorePercent : void 0;
        if (!d1ScoreEntry || d1ScoreEntry < (d2ScoreEntry != null ? d2ScoreEntry : 0))
          return -1;
        if (!d2ScoreEntry || d2ScoreEntry < d1ScoreEntry)
          return 1;
        return 0;
      },
      render: (entityScoreEntry) => {
        var _a;
        const currentScoreEntry = (entityScoreEntry == null ? void 0 : entityScoreEntry.areaScores) ? entityScoreEntry.areaScores.find((a) => a.title === area.title) : void 0;
        const chipStyle = {
          margin: 0,
          backgroundColor: scoreToColorConverter(
            currentScoreEntry == null ? void 0 : currentScoreEntry.scoreSuccess
          ).background,
          color: scoreToColorConverter(
            currentScoreEntry == null ? void 0 : currentScoreEntry.scoreSuccess
          ).foreground,
          minWidth: "4rem"
        };
        const label = (_a = currentScoreEntry == null ? void 0 : currentScoreEntry.scoreLabel) != null ? _a : `${currentScoreEntry == null ? void 0 : currentScoreEntry.scorePercent} %`;
        return typeof (currentScoreEntry == null ? void 0 : currentScoreEntry.scorePercent) !== "undefined" ? /* @__PURE__ */ React.createElement(
          Chip,
          {
            label,
            style: chipStyle
          }
        ) : null;
      }
    });
    return areas;
  }, []);
  columns.push({
    title: "Total",
    align: "right",
    field: "scorePercent",
    render: (entityScoreEntry) => {
      var _a;
      const chipStyle = {
        margin: 0,
        backgroundColor: scoreToColorConverter(entityScoreEntry == null ? void 0 : entityScoreEntry.scoreSuccess).background,
        color: scoreToColorConverter(entityScoreEntry == null ? void 0 : entityScoreEntry.scoreSuccess).foreground,
        float: "right",
        minWidth: "4rem"
      };
      const label = (_a = entityScoreEntry == null ? void 0 : entityScoreEntry.scoreLabel) != null ? _a : `${entityScoreEntry == null ? void 0 : entityScoreEntry.scorePercent} %`;
      return typeof entityScoreEntry.scorePercent !== "undefined" ? /* @__PURE__ */ React.createElement(Chip, { label, style: chipStyle }) : null;
    }
  });
  const minDefaultPageSizeOption = scores.length >= 10 ? scores.length : 10;
  const maxDefaultPageSizeOption = scores.length < 100 ? minDefaultPageSizeOption : 100;
  const defaultPageSizeOption = minDefaultPageSizeOption > maxDefaultPageSizeOption ? maxDefaultPageSizeOption : minDefaultPageSizeOption;
  return /* @__PURE__ */ React.createElement("div", { "data-testid": "score-board-table" }, /* @__PURE__ */ React.createElement(
    Table,
    {
      title: title != null ? title : "Entities scores overview",
      options: {
        search: true,
        paging: true,
        padding: "dense",
        pageSize: defaultPageSizeOption,
        pageSizeOptions: [defaultPageSizeOption, 20, 50, 100, 200]
      },
      columns,
      data: scores
    }
  ));
};
const ScoreCardTable = ({ title, entityKindFilter }) => {
  const { loading, error, value: data } = useScoringAllDataLoader(entityKindFilter);
  if (loading) {
    return /* @__PURE__ */ React.createElement(Progress, null);
  } else if (error) {
    return getWarningPanel(error);
  }
  return /* @__PURE__ */ React.createElement(ScoreTable, { title, scores: data || [] });
};

const scoreCardPlugin = createPlugin({
  id: "score-card",
  routes: {
    root: rootRouteRef
  },
  apis: [
    createApiFactory({
      api: scoringDataApiRef,
      deps: {
        configApi: configApiRef,
        catalogApi: catalogApiRef,
        fetchApi: fetchApiRef
      },
      factory: ({ configApi, catalogApi, fetchApi }) => new ScoringDataJsonClient({
        configApi,
        catalogApi,
        fetchApi
      })
    })
  ]
});
const ScoreBoardPage = scoreCardPlugin.provide(
  createRoutableExtension({
    name: "score-board-page",
    component: () => import('./index-24b5533d.esm.js').then((m) => m.ScoreBoardPage),
    mountPoint: rootRouteRef
  })
);
const EntityScoreCardContent = scoreCardPlugin.provide(
  createComponentExtension({
    name: "score-board-card",
    component: {
      lazy: () => import('./index-74a29f2d.esm.js').then((m) => m.ScoreCard)
    }
  })
);

export { EntityScoreCardContent as E, ScoreCardTable as S, scoringDataApiRef as a, scoreCardPlugin as b, ScoreBoardPage as c, ScoreSuccessEnum as d, ScoringDataJsonClient as e, getWarningPanel as g, nameToColorCombinationConverter as n, scoreToColorConverter as s };
//# sourceMappingURL=index-9bacc580.esm.js.map
