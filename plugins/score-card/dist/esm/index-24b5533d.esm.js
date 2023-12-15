import React from 'react';
import { Grid } from '@material-ui/core';
import { Page, Header, HeaderLabel, Content, ContentHeader, SupportButton } from '@backstage/core-components';
import { S as ScoreCardTable } from './index-9bacc580.esm.js';
import '@backstage/core-plugin-api';
import '@backstage/plugin-catalog-react';
import '@backstage/catalog-model';
import 'react-use/lib/useAsync';

const ScoreBoardPage = ({
  title,
  subTitle,
  tableTitle,
  entityKindFilter
}) => /* @__PURE__ */ React.createElement(Page, { themeId: "tool" }, /* @__PURE__ */ React.createElement(
  Header,
  {
    title: title != null ? title : "Score board",
    subtitle: subTitle != null ? subTitle : "Overview of entity scores"
  },
  /* @__PURE__ */ React.createElement(HeaderLabel, { label: "Maintainer", value: "Oriflame" }),
  /* @__PURE__ */ React.createElement(HeaderLabel, { label: "Status", value: "Alpha" })
), /* @__PURE__ */ React.createElement(Content, null, /* @__PURE__ */ React.createElement(ContentHeader, { title: "" }, /* @__PURE__ */ React.createElement(SupportButton, null, "In this table you may see overview of entity scores.")), /* @__PURE__ */ React.createElement(Grid, { container: true, spacing: 3, direction: "column" }, /* @__PURE__ */ React.createElement(Grid, { item: true }, /* @__PURE__ */ React.createElement(
  ScoreCardTable,
  {
    title: tableTitle,
    entityKindFilter
  }
)))));

export { ScoreBoardPage };
//# sourceMappingURL=index-24b5533d.esm.js.map
