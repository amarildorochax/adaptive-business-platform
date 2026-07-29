/**
 * Backup / Restore — registro de cópia recuperável de dado crítico e de recuperação a partir dela.
 * Estrutura, regras e invariantes definidas em DATA_CONCRETE_STRUCTURE.md.
 */
export interface BackupRecord {
  /** Identificador do Backup. */
  readonly id: string;

  /** Nome do conjunto de dado protegido por este Backup. */
  readonly dataSetName: string;

  /** Momento em que o Backup foi criado. */
  readonly createdAt: Date;

  /** Momento em que a restauração real deste Backup foi testada e confirmada, quando já verificado. */
  readonly verifiedAt?: Date;
}

export interface RestoreRecord {
  /** Identificador do BackupRecord a partir do qual esta recuperação foi executada. */
  readonly backupId: string;

  /** Momento em que a recuperação foi executada. */
  readonly restoredAt: Date;
}
