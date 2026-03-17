export type ElementType = 'machine' | 'workstation' | 'storage' | 'conveyor' | 'area' | 'label' | 'arrow' | 'worker';

export interface LayoutElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  status: 'active' | 'maintenance' | 'idle';
  capacity?: number;
  color: string;
  fill?: string;
  rotation?: number;
  fontSize?: number;
  showCross?: boolean;
  isVertical?: boolean;
  task?: string;
  level?: number | string;
  workerId?: string;
  operationTime?: string;
  sequenceNumber?: number;
  analysisTime?: string;
  isCTQ?: boolean;
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  type?: 'flow' | 'logic';
}

export interface FactoryLayout {
  id: string;
  name: string;
  elements: LayoutElement[];
  connections: Connection[];
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
  bom?: {
    name: string;
    data: string;
    type?: 'excel' | 'pdf';
  };
  pdfBom?: {
    name: string;
    data: string;
  };
  schematicPdf?: {
    name: string;
    data: string;
  };
  processPdf?: {
    name: string;
    data: string;
  };
  modelImages?: {
    name: string;
    data: string;
  }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
