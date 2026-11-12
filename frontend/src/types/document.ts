export interface DocumentItem {
  id: number;
  title: string;
  content: string;
  ownerId: number;
  ownerName: string;
  role?: string;
  workspaceId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceItem {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  ownerName: string;
  createdAt: string;
}
