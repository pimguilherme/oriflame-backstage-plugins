/*
 * Copyright 2022 Oriflame
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export interface Config {
  /**
   * Extra configuration for score card plugin
   */
  scorecards: {
    /**
     * The public absolute root URL with json file defining the score card entries.
     * @visibility frontend
     */
    jsonDataUrl?: string;
    /**
     * Whether we should fetch all entites instead of filtering by the entity names
     * Will still respect the entityKindFilter given to the ScoreBoardPage component
     * @visibility frontend
     */
    fetchAllEntities?: string;
    /**
     * Provides extra color combinations, possibly overriding existing ones (ex score-failure, score-success)
     * Format should be: <color-name> <foreground> <background> (one combination per line)
     * Example: 
     *  score-failure #ff0000aa #00000022
     *  score-almost-failure #ff0000aa #00000022
     * @visibility frontend
     */
    colorCombinations?: string,
    /**
     * The template for the link to the wiki, e.g. "https://TBD/XXX/_wiki/wikis/XXX.wiki/{id}"
     * @visibility frontend
     */
     wikiLinkTemplate?: string;
  };
}
