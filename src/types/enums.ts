export enum TaskProgressStatus {
    Assigned = 0,
    Received = 1,
    InProgress = 2,
    ReadyForReview = 3,
}

export enum TaskCompletionStatus {
    Active = 0,
    Completed = 1,
    Reopened = 2,
}

export enum WorkspaceRole {
    Member = 0,
    PrivilegedMember = 1,
    Owner = 2,
}