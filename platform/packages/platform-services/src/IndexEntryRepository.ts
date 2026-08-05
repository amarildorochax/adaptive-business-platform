import type { IndexEntry } from "./IndexEntry.js";

/** Index Entry Repository — o registro de indexação é um fato imutável; nunca `update` nem `remove`. */
export interface IndexEntryRepository {
  create(entry: IndexEntry): Promise<IndexEntry>;
  findByAssetId(assetId: string): Promise<IndexEntry | undefined>;
}
