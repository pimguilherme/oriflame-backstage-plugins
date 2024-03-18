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

import { MarkdownContent, TableColumn } from '@backstage/core-components';
import React from 'react';
import { EntityScoreTableEntry } from '../helpers/getScoreTableEntries';
import { nameToColorCombinationConverter } from '../../../helpers/nameToColorCombinationConverter';

export const detailsColumn: TableColumn<EntityScoreTableEntry> = {
  title: 'Details',
  field: 'details',
  grouping: false,
  render: entityScoreEntry => {
    const scoreHints = (entityScoreEntry.scoreHints as string[])?.join?.(', ');
    const hints = scoreHints ?? entityScoreEntry.scoreHints;
    return (
      <div style={{lineHeight: '1.2rem'}}>
        <MarkdownContent dialect='gfm' linkTarget="_blank" content={entityScoreEntry.details} />
        {
          entityScoreEntry.extraDetails
            ? <div style={{
              marginTop: '10px',
              padding: '1px 8px',
              color: nameToColorCombinationConverter(entityScoreEntry.extraDetailsColor ?? `extra-details-${entityScoreEntry.scoreSuccess}`).foreground,
              backgroundColor: nameToColorCombinationConverter(entityScoreEntry.extraDetailsColor ?? `extra-details-${entityScoreEntry.scoreSuccess}`).background,
              fontStyle: 'italic'
            }}>
              <MarkdownContent content={entityScoreEntry.extraDetails} linkTarget="_blank" />
            </div>
            : null

        }
        {hints ? <em>hints: {hints}</em> : null}
      </div>
    );
  },
};
