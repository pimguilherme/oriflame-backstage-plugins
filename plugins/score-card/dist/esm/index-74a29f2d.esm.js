import { EntityRefLink, useEntity } from '@backstage/plugin-catalog-react';
import { Chip, Link, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { MarkdownContent, InfoCard, Progress, EmptyState, Table } from '@backstage/core-components';
import { useApi, errorApiRef, configApiRef } from '@backstage/core-plugin-api';
import { s as scoreToColorConverter, n as nameToColorCombinationConverter, g as getWarningPanel, a as scoringDataApiRef } from './index-9bacc580.esm.js';
import '@backstage/catalog-model';

function getScoreTableEntries(value) {
  if (!value || value.areaScores.length <= 0)
    return [];
  return value.areaScores.reduce(
    (entries, area) => entries.concat(
      area.scoreEntries.map((entry) => {
        return {
          area: area.title,
          ...entry
        };
      })
    ),
    []
  );
}

function areaColumn(value) {
  return {
    title: "Area",
    field: "area",
    grouping: true,
    groupTitle: "Area",
    defaultGroupOrder: 0,
    width: "1px",
    render: (data, type) => {
      var _a;
      if (type === "group") {
        const area = value == null ? void 0 : value.areaScores.find((a) => a.title === data.toString());
        const areaGateStyle = {
          marginTop: "0.5rem",
          marginRight: "1rem",
          backgroundColor: scoreToColorConverter(area == null ? void 0 : area.scoreSuccess).background,
          color: scoreToColorConverter(area == null ? void 0 : area.scoreSuccess).foreground,
          float: "right",
          minWidth: "4rem"
        };
        const areaGateLabel = (_a = area == null ? void 0 : area.scoreLabel) != null ? _a : `${area == null ? void 0 : area.scorePercent} %`;
        return /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement(React.Fragment, null, data, /* @__PURE__ */ React.createElement(Chip, { label: areaGateLabel, style: areaGateStyle })));
      }
      return /* @__PURE__ */ React.createElement(Link, null, data.area);
    }
  };
}

const detailsColumn = {
  title: "Details",
  field: "details",
  grouping: false,
  render: (entityScoreEntry) => {
    var _a, _b, _c, _d;
    const scoreHints = (_b = (_a = entityScoreEntry.scoreHints) == null ? void 0 : _a.join) == null ? void 0 : _b.call(_a, ", ");
    const hints = scoreHints != null ? scoreHints : entityScoreEntry.scoreHints;
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(MarkdownContent, { dialect: "gfm", content: entityScoreEntry.details }), entityScoreEntry.extraDetails ? /* @__PURE__ */ React.createElement("div", { style: {
      marginTop: "10px",
      padding: "1px 8px",
      color: nameToColorCombinationConverter((_c = entityScoreEntry.extraDetailsColor) != null ? _c : `extra-details-${entityScoreEntry.scoreSuccess}`).foreground,
      backgroundColor: nameToColorCombinationConverter((_d = entityScoreEntry.extraDetailsColor) != null ? _d : `extra-details-${entityScoreEntry.scoreSuccess}`).background,
      fontStyle: "italic"
    } }, /* @__PURE__ */ React.createElement(MarkdownContent, { content: entityScoreEntry.extraDetails })) : null, hints ? /* @__PURE__ */ React.createElement("em", null, "hints: ", hints) : null);
  }
};

const scorePercentColumn = {
  title: /* @__PURE__ */ React.createElement("div", { style: { minWidth: "3.5rem" } }, "Score"),
  field: "scorePercent",
  align: "right",
  grouping: false,
  width: "1%",
  render: (entityScoreEntry) => {
    var _a;
    const chipStyle = {
      margin: 0,
      backgroundColor: scoreToColorConverter(entityScoreEntry == null ? void 0 : entityScoreEntry.scoreSuccess).background,
      color: scoreToColorConverter(entityScoreEntry == null ? void 0 : entityScoreEntry.scoreSuccess).foreground,
      minWidth: "4rem"
    };
    const label = (_a = entityScoreEntry == null ? void 0 : entityScoreEntry.scoreLabel) != null ? _a : `${entityScoreEntry.scorePercent} %`;
    return typeof entityScoreEntry.scorePercent !== "undefined" ? /* @__PURE__ */ React.createElement(Chip, { label, style: chipStyle }) : null;
  }
};

function getWikiUrl(wikiLinkTemplate, entry) {
  if (!entry)
    return wikiLinkTemplate.replace(/\{[^\}]+\}/g, "");
  return wikiLinkTemplate.replace(/\{[^\}]+\}/g, (matched) => {
    const keyName = matched.substring(1, matched.length - 1);
    const value = entry[keyName];
    return !value ? "" : value.toString();
  });
}

function titleColumn(wikiLinkTemplate) {
  return {
    title: /* @__PURE__ */ React.createElement("div", { style: { minWidth: "7rem" } }, "Requirement"),
    field: "title",
    grouping: false,
    width: "1%",
    render: (entityScoreEntry) => {
      const wikiUrl = getWikiUrl(wikiLinkTemplate, entityScoreEntry);
      const title = entityScoreEntry.titleLabel ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: "12px",
        borderRadius: "4px",
        padding: "0px 4px",
        display: "inline-block",
        marginBottom: "4px",
        color: nameToColorCombinationConverter(entityScoreEntry.titleLabelColor).foreground,
        backgroundColor: nameToColorCombinationConverter(entityScoreEntry.titleLabelColor).background
      } }, entityScoreEntry.titleLabel), /* @__PURE__ */ React.createElement("br", null), entityScoreEntry.title) : /* @__PURE__ */ React.createElement(React.Fragment, null, entityScoreEntry.title);
      return /* @__PURE__ */ React.createElement("span", { style: { lineHeight: "20px" } }, wikiUrl ? /* @__PURE__ */ React.createElement(
        Link,
        {
          href: wikiUrl,
          target: "_blank",
          "data-id": entityScoreEntry.id
        },
        title
      ) : /* @__PURE__ */ React.createElement(React.Fragment, null, title), entityScoreEntry.isOptional ? " (Optional)" : null);
    }
  };
}

function getReviewerLink(value) {
  var _a;
  return /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right", margin: "0.2rem" } }, value.reviewer ? /* @__PURE__ */ React.createElement(React.Fragment, null, "Review done by\xA0", /* @__PURE__ */ React.createElement(EntityRefLink, { entityRef: value.reviewer }, (_a = value.reviewer) == null ? void 0 : _a.name), "\xA0at\xA0", value.reviewDate ? value.reviewDate.toLocaleDateString() : "unknown") : /* @__PURE__ */ React.createElement(React.Fragment, null, "Not yet reviewed."));
}

const useStyles = makeStyles((theme) => ({
  badgeLabel: {
    color: theme.palette.common.white
  },
  header: {
    padding: theme.spacing(2, 2, 2, 2.5)
  },
  action: {
    margin: 0
  },
  disabled: {
    backgroundColor: theme.palette.background.default
  }
}));
const useScoringDataLoader = () => {
  var _a;
  const errorApi = useApi(errorApiRef);
  const scorigDataApi = useApi(scoringDataApiRef);
  const config = useApi(configApiRef);
  const { entity } = useEntity();
  const { error, value, loading } = useAsync(
    async () => scorigDataApi.getScore(entity),
    [scorigDataApi, entity]
  );
  useEffect(() => {
    if (error) {
      errorApi.post(error);
    }
  }, [error, errorApi]);
  const wikiLinkTemplate = (_a = config.getOptionalString("scorecards.wikiLinkTemplate")) != null ? _a : "";
  return { loading, value, wikiLinkTemplate, error };
};
const ScoreCard = ({
  variant = "gridItem"
}) => {
  var _a;
  const {
    loading,
    error,
    value: data,
    wikiLinkTemplate
  } = useScoringDataLoader();
  const classes = useStyles();
  let gateLabel = "Not computed";
  const gateStyle = {
    margin: 0,
    backgroundColor: scoreToColorConverter(data == null ? void 0 : data.scoreSuccess).background,
    color: scoreToColorConverter(data == null ? void 0 : data.scoreSuccess).foreground
  };
  if ((data == null ? void 0 : data.scorePercent) || (data == null ? void 0 : data.scorePercent) === 0) {
    const label = (_a = data == null ? void 0 : data.scoreLabel) != null ? _a : `${data.scorePercent} %`;
    gateLabel = `Total score: ${label}`;
  }
  const qualityBadge = !loading && /* @__PURE__ */ React.createElement(Chip, { label: gateLabel, style: gateStyle });
  const columns = [
    areaColumn(data),
    titleColumn(wikiLinkTemplate),
    detailsColumn,
    scorePercentColumn
  ];
  const allEntries = getScoreTableEntries(data);
  return /* @__PURE__ */ React.createElement(
    InfoCard,
    {
      title: "Scoring",
      variant,
      headerProps: {
        action: qualityBadge,
        classes: {
          root: classes.header,
          action: classes.action
        }
      }
    },
    loading && /* @__PURE__ */ React.createElement(Progress, null),
    error && getWarningPanel(error),
    !loading && !data && /* @__PURE__ */ React.createElement("div", { "data-testid": "score-card-no-data" }, /* @__PURE__ */ React.createElement(
      EmptyState,
      {
        missing: "info",
        title: "No information to display",
        description: "There is no data available for this entity"
      }
    )),
    !loading && data && /* @__PURE__ */ React.createElement("div", { "data-testid": "score-card" }, /* @__PURE__ */ React.createElement(
      Grid,
      {
        item: true,
        container: true,
        direction: "column",
        justifyContent: "space-between",
        alignItems: "stretch",
        style: { height: "100%" },
        spacing: 0
      },
      /* @__PURE__ */ React.createElement(
        Table,
        {
          title: "Score of each requirement",
          options: {
            search: true,
            paging: false,
            grouping: true,
            padding: "dense"
          },
          columns,
          data: allEntries,
          components: {
            Groupbar: () => null
            // we do not want to display possibility to change grouping
          }
        }
      ),
      getReviewerLink(data)
    ))
  );
};

export { ScoreCard };
//# sourceMappingURL=index-74a29f2d.esm.js.map
