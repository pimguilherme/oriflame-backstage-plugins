import * as _backstage_core_components from '@backstage/core-components';
import * as _backstage_catalog_model from '@backstage/catalog-model';
import { CompoundEntityRef, Entity } from '@backstage/catalog-model';
import * as _backstage_core_plugin_api from '@backstage/core-plugin-api';
import { ConfigApi, FetchApi } from '@backstage/core-plugin-api';
import { CatalogApi } from '@backstage/plugin-catalog-react';

declare enum ScoreSuccessEnum {
    Success = "success",
    AlmostSuccess = "almost-success",
    Partial = "partial",
    AlmostFailure = "almost-failure",
    Failure = "failure"
}
interface EntityScore {
    entityRef: CompoundEntityRef;
    generatedDateTimeUtc: Date | string;
    scorePercent: number;
    scoreLabel?: string;
    scoreSuccess: ScoreSuccessEnum;
    scoringReviewer: string | CompoundEntityRef | undefined | null;
    scoringReviewDate: Date | string | undefined | null;
    areaScores: EntityScoreArea[];
}
interface EntityScoreArea {
    id: number;
    title: string;
    scorePercent: number;
    scoreLabel?: string;
    scoreSuccess: ScoreSuccessEnum;
    scoreEntries: EntityScoreEntry[];
}
interface EntityScoreEntry {
    id: number;
    title: string;
    titleLabel?: string;
    titleLabelColor?: string;
    isOptional: boolean;
    scorePercent: number;
    scoreLabel?: string;
    scoreSuccess: ScoreSuccessEnum;
    scoreHints: string | string[];
    details: string;
    extraDetails?: string;
    extraDetailsColor?: string;
}
interface EntityScoreExtended extends EntityScore {
    owner: CompoundEntityRef | undefined;
    reviewer: CompoundEntityRef | undefined;
    reviewDate: Date | undefined;
}

declare type ScoreCardTableProps = {
    title?: string;
    entityKindFilter?: string[];
};
declare const ScoreCardTable: ({ title, entityKindFilter }: ScoreCardTableProps) => JSX.Element;

declare const scoreCardPlugin: _backstage_core_plugin_api.BackstagePlugin<{
    root: _backstage_core_plugin_api.RouteRef<undefined>;
}, {}, {}>;
declare const ScoreBoardPage: ({ title, subTitle, tableTitle, entityKindFilter, }: {
    title?: string | undefined;
    subTitle?: string | undefined;
    tableTitle?: string | undefined;
    entityKindFilter?: string[] | undefined;
}) => JSX.Element;
declare const EntityScoreCardContent: ({ variant, }: {
    entity?: _backstage_catalog_model.Entity | undefined;
    variant?: _backstage_core_components.InfoCardVariants | undefined;
}) => JSX.Element;

declare const scoringDataApiRef: _backstage_core_plugin_api.ApiRef<ScoringDataApi>;
declare type ScoringDataApi = {
    getScore(entity?: Entity): Promise<EntityScoreExtended | undefined>;
    getAllScores(entityKindFilter?: string[]): Promise<EntityScoreExtended[] | undefined>;
};

/**
 * Default JSON data client. Expects JSON files in a format see /sample-data
 */
declare class ScoringDataJsonClient implements ScoringDataApi {
    configApi: ConfigApi;
    catalogApi: CatalogApi;
    fetchApi: FetchApi;
    constructor({ configApi, catalogApi, fetchApi, }: {
        configApi: ConfigApi;
        catalogApi: CatalogApi;
        fetchApi: FetchApi;
    });
    getScore(entity?: Entity): Promise<EntityScoreExtended | undefined>;
    getAllScores(entityKindFilter?: string[]): Promise<EntityScoreExtended[] | undefined>;
    private getJsonDataUrl;
    private extendEntityScore;
}

export { EntityScore, EntityScoreArea, EntityScoreCardContent, EntityScoreEntry, ScoreBoardPage, ScoreCardTable, ScoreSuccessEnum, ScoringDataApi, ScoringDataJsonClient, scoreCardPlugin, scoringDataApiRef };
